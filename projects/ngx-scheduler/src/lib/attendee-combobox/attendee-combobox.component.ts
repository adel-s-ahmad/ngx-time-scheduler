import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy,
  Renderer2,
  Inject,
  AfterViewChecked
} from '@angular/core';
import { DOCUMENT, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { Attendee } from '../ngx-scheduler.model';
import { AttendeeService } from '../attendee.service';

export interface AsyncLoadConfig {
  apiUrl?: string;
  queryParamName?: string;
  responseDataPath?: string;
  debounceMs?: number;
  timeoutMs?: number;
  closeOnSelect?: boolean;  // New option to control dropdown behavior after selection
}

@Component({
  selector: 'app-attendee-combobox',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './attendee-combobox.component.html',
  styleUrls: ['./attendee-combobox.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'style': 'position: relative; display: block; width: 100%;'
  }
})
export class AttendeeComboboxComponent implements OnInit, OnDestroy, AfterViewChecked {
  @Input() items: Attendee[] = [];
  @Input() placeholder = 'Search...';
  @Input() groupTitle = '';
  @Input() asyncConfig?: AsyncLoadConfig;
  @Input() closeOnSelect = true;  // Default to closing after selection

  @Output() itemSelected = new EventEmitter<Attendee>();

  @ViewChild('inputElement', { static: false }) inputElement?: ElementRef<HTMLInputElement>;
  @ViewChild('dropdownElement', { static: false, read: ElementRef }) dropdownElement?: ElementRef<HTMLDivElement>;

  filterText = '';
  isOpen = false;
  filteredItems: Attendee[] = [];
  selectedIndex = -1;
  isLoading = false;
  dropdownStyle: { [key: string]: string } = {};
  private needsPositioning = false;

  private destroy$ = new Subject<void>();
  private filterChange$ = new Subject<string>();
  private subscription?: Subscription;
  private scrollParent?: HTMLElement | null;
  private boundRepositionHandler?: () => void;
  private document: Document;

  constructor(
    private cdr: ChangeDetectorRef,
    private attendeeService: AttendeeService,
    private host: ElementRef<HTMLElement>,
    private renderer: Renderer2,
    @Inject(DOCUMENT) documentRef: Document
  ) {
    this.document = documentRef;
  }

  ngOnInit(): void {
    // Setup debounced async search if configured
    if (this.asyncConfig?.apiUrl) {
      this.setupAsyncSearch();
    } else {
      this.updateFilteredItems();
    }

    // Bind scroll/resize listeners to reposition dropdown when open
    this.bindRepositionListeners();

    // Add global click listener to close dropdown when clicking outside
    this.renderer.listen('document', 'click', (event: MouseEvent) => {
      this.onDocumentClick(event);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.unbindRepositionListeners();
    this.removeDropdownFromBody();
  }

  ngAfterViewChecked(): void {
    if (this.needsPositioning && this.dropdownElement) {
      this.needsPositioning = false;
      this.updateDropdownPosition();
    }
  }

  private setupAsyncSearch(): void {
    const debounceMs = this.asyncConfig?.debounceMs ?? 300;

    this.subscription = this.filterChange$
      .pipe(
        debounceTime(debounceMs),
        takeUntil(this.destroy$)
      )
      .subscribe(searchTerm => {
        this.performAsyncSearch(searchTerm);
      });
  }

  private performAsyncSearch(searchTerm: string): void {
    if (!this.asyncConfig?.apiUrl) return;

    this.isLoading = true;
    this.cdr.markForCheck();

    this.attendeeService
      .fetchAttendees(
        this.asyncConfig.apiUrl,
        searchTerm,
        this.asyncConfig.queryParamName ?? 'q',
        this.asyncConfig.responseDataPath ?? '',
        this.asyncConfig.timeoutMs ?? 10000
      )
      .subscribe(attendees => {
        this.filteredItems = attendees;
        this.isLoading = false;
        this.selectedIndex = -1;
        this.cdr.markForCheck();
      });
  }

  onInputChange(): void {
    // If async is configured, use debounced search
    if (this.asyncConfig?.apiUrl) {
      this.filterChange$.next(this.filterText);
    } else {
      // Otherwise, use local filtering
      this.updateFilteredItems();
    }

    this.isOpen = true;
    this.selectedIndex = -1;
    this.needsPositioning = true;
    this.cdr.markForCheck();
  }

  onInputFocus(): void {
    this.isOpen = true;

    // If async is configured and dropdown is opening without search term, fetch all items
    if (this.asyncConfig?.apiUrl && !this.filterText.trim()) {
      this.performAsyncSearch('');
    }

    this.needsPositioning = true;
    this.cdr.markForCheck();
  }

  onInputClick(): void {
    // Handle click event separately from focus to reopen dropdown when already focused
    if (!this.isOpen) {
      this.isOpen = true;

      // If async is configured and no search term, fetch all items
      if (this.asyncConfig?.apiUrl && !this.filterText.trim()) {
        this.performAsyncSearch('');
      }

      this.needsPositioning = true;
      this.cdr.markForCheck();
    }
  }

  onInputBlur(): void {
    // Delay to allow click on item to be processed
    Promise.resolve().then(() => {
      this.isOpen = false;
      this.hideDropdown();
      this.cdr.markForCheck();
    });
  }

  onKeyDown(event: KeyboardEvent): void {
    if (!this.isOpen) {
      if (event.key === 'ArrowDown' || event.key === ' ') {
        this.isOpen = true;
        this.cdr.markForCheck();
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectedIndex = Math.min(this.selectedIndex + 1, this.filteredItems.length - 1);
        this.cdr.markForCheck();
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
        this.cdr.markForCheck();
        break;
      case 'Enter':
        event.preventDefault();
        if (this.selectedIndex >= 0 && this.selectedIndex < this.filteredItems.length) {
          this.selectItem(this.filteredItems[this.selectedIndex]);
        }
        break;
      case 'Escape':
        event.preventDefault();
        this.isOpen = false;
        this.cdr.markForCheck();
        break;
    }
  }

  selectItem(item: Attendee): void {
    this.itemSelected.emit(item);
    this.filterText = '';
    this.selectedIndex = -1;
    this.updateFilteredItems();

    // Check closeOnSelect preference (input or from asyncConfig)
    const shouldClose = this.asyncConfig?.closeOnSelect ?? this.closeOnSelect;

    if (shouldClose) {
      // Close and blur to allow next click to re-open
      this.isOpen = false;
      this.hideDropdown();
      this.cdr.markForCheck();
      Promise.resolve().then(() => {
        this.inputElement?.nativeElement.blur();
      });
    } else {
      // Keep open and refetch for rapid multi-select
      if (this.asyncConfig?.apiUrl) {
        this.performAsyncSearch('');
      }
      this.needsPositioning = true;
      this.cdr.markForCheck();
      Promise.resolve().then(() => {
        this.inputElement?.nativeElement.focus();
      });
    }
  }

  onOptionHover(index: number): void {
    this.selectedIndex = index;
    this.cdr.markForCheck();
  }

  onOptionMouseDown(item: Attendee, event: MouseEvent): void {
    // Prevent default to avoid focus/blur race and ensure selection fires
    event.preventDefault();
    this.selectItem(item);
  }

  private updateFilteredItems(): void {
    const term = this.filterText.toLowerCase().trim();
    if (!term) {
      this.filteredItems = this.items;
    } else {
      this.filteredItems = this.items.filter(item =>
        item.displayName.toLowerCase().includes(term) ||
        (item.email || '').toLowerCase().includes(term)
      );
    }
  }

  // Ensure stable identity for options to avoid first-item render quirks
  trackByFn(index: number, item: Attendee): string | number {
    return item?.id ?? index;
  }

  private updateDropdownPosition(): void {
    if (!this.isOpen || !this.inputElement || !this.dropdownElement) {
      return;
    }

    const dropdown = this.dropdownElement.nativeElement;
    const input = this.inputElement.nativeElement;
    const rect = input.getBoundingClientRect();

    // Move dropdown to body if not already there
    if (dropdown.parentElement !== this.document.body) {
      this.renderer.appendChild(this.document.body, dropdown);
    }

    // Position it below the input using fixed positioning
    this.renderer.setStyle(dropdown, 'position', 'fixed');
    this.renderer.setStyle(dropdown, 'top', `${rect.bottom + 2}px`);
    this.renderer.setStyle(dropdown, 'left', `${rect.left}px`);
    this.renderer.setStyle(dropdown, 'width', `${rect.width}px`);
    this.renderer.setStyle(dropdown, 'z-index', '99999');
  }

  private hideDropdown(): void {
    // Dropdown visibility is handled by *ngIf which will remove it from body
    this.removeDropdownFromBody();
  }

  private removeDropdownFromBody(): void {
    if (this.dropdownElement?.nativeElement?.parentElement === this.document.body) {
      this.renderer.removeChild(this.document.body, this.dropdownElement.nativeElement);
    }
  }

  private onDocumentClick(event: MouseEvent): void {
    // Check if click is outside the combobox component
    const target = event.target as HTMLElement;
    const isClickInside = this.host?.nativeElement.contains(target);

    if (!isClickInside && this.isOpen) {
      // Click is outside, close the dropdown
      this.isOpen = false;
      this.removeDropdownFromBody();
      this.cdr.markForCheck();
    }
  }

  private bindRepositionListeners(): void {
    this.boundRepositionHandler = () => {
      this.updateDropdownPosition();
    };
    window.addEventListener('scroll', this.boundRepositionHandler, true);
    window.addEventListener('resize', this.boundRepositionHandler, true);
    // Attempt to bind to nearest scrollable parent inside scheduler
    this.scrollParent = this.host?.nativeElement.closest('.unified-grid-body');
    if (this.scrollParent) {
      this.scrollParent.addEventListener('scroll', this.boundRepositionHandler, true);
    }
  }

  private unbindRepositionListeners(): void {
    if (this.boundRepositionHandler) {
      window.removeEventListener('scroll', this.boundRepositionHandler, true);
      window.removeEventListener('resize', this.boundRepositionHandler, true);
      if (this.scrollParent) {
        this.scrollParent.removeEventListener('scroll', this.boundRepositionHandler, true);
      }
    }
  }
}
