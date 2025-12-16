import {ChangeDetectorRef, Component, ElementRef, Input, Output, EventEmitter, OnDestroy, OnInit, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {CdkDragDrop} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import {
  HeaderDetails,
  Header,
  ItemMeta,
  Item,
  Period,
  SectionItem,
  Section,
  Text,
  Events,
  Attendee,
  AttendeeGroup,
  AttendeeGroupConfig,
  AvailabilityStatus
} from './ngx-scheduler.model';
import { AttendeeComboboxComponent } from './attendee-combobox/attendee-combobox.component';
import { LocalizationService } from './localization.service';
import moment_, { Moment } from 'moment';
import {Subscription} from 'rxjs';
import { NgxTimeSchedulerService } from './ngx-scheduler.service';

const moment = moment_;

@Component({
  selector: 'ngx-ts[items][periods][sections]',
  templateUrl: './ngx-scheduler.component.html',
  styleUrls: ['./ngx-scheduler.component.css', './ngx-scheduler.component-rtl.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, AttendeeComboboxComponent]
})
export class NgxTimeSchedulerComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('sectionTd') set SectionTd(elementRef: ElementRef | undefined) {
    if (elementRef) {
      this.SectionLeftMeasure = elementRef.nativeElement.clientWidth + 'px';
      this.changeDetector.detectChanges();
    }
  }

  @ViewChild('attendeeRows') attendeeRowsElement: ElementRef | undefined;
  @ViewChild('schedulerContent') schedulerContentElement: ElementRef | undefined;
  @ViewChild('unifiedScroll') unifiedScrollElement: ElementRef | undefined;
  @ViewChild('timeHeaderInner') timeHeaderInnerElement: ElementRef | undefined;

  private isScrolling = false;

  @Input() currentTimeFormat = 'DD-MMM-YYYY HH:mm';
  @Input() showCurrentTime = true;
  @Input() showHeaderTitle = true;
  @Input() showActionButtons = true;
  @Input() showGoto = true;
  @Input() showToday = true;
  @Input() allowDragging = false;
  // @Input() allowResizing = false;
  @Input() locale = '';
  @Input() showBusinessDayOnly = false;
  @Input() headerFormat = 'Do MMM YYYY';
  @Input() minRowHeight = 40;
  @Input() maxHeight: string | null = null;
  @Input() text = new Text();
  @Input() items: Item[] = [];
  @Input() sections: Section[] = [];
  @Input() periods: Period[] = [];
  @Input() events: Events = new Events();
  @Input() start = moment().startOf('day');
  @Input() selectedFromTime: moment.Moment | null = null;
  @Input() selectedToTime: moment.Moment | null = null;
  @Input() language = 'en'; // Language input for component
  @Output() attendeeSelected = new EventEmitter<{ groupKey: string; attendee: Attendee }>();

  // Attendee grouping and inline add controls
  @Input() attendeeGroupConfigs: AttendeeGroupConfig[] = [
    { key: 'contacts', title: 'Contacts' },
    { key: 'users', title: 'Users' },
    { key: 'rooms', title: 'Rooms' }
  ];
  @Input() availableAttendees: Attendee[] = [];
  @Input() initialAttendeeGroups: AttendeeGroup[] | null = null;
  attendeeGroups: AttendeeGroup[] = [];
  
  // Localization properties
  isRTL = false;
  textDirection: 'ltr' | 'rtl' = 'ltr';

  end = moment().endOf('day');
  showGotoModal = false;

    initializeAttendeeGroups(): void {
      if (this.initialAttendeeGroups && this.initialAttendeeGroups.length) {
        this.attendeeGroups = this.initialAttendeeGroups.map(g => ({ key: g.key, title: g.title, attendees: [...(g.attendees || [])] }));
      } else {
        this.attendeeGroups = this.attendeeGroupConfigs.map(cfg => ({ key: cfg.key, title: cfg.title, attendees: [] }));
      }

      // If groups are configured, derive sections from groups instead of using the sections input
      if (this.attendeeGroupConfigs && this.attendeeGroupConfigs.length > 0) {
        this.rebuildSectionsFromGroups();
      }
    }

    private rebuildSectionsFromGroups(): void {
      // Build sections array with group titles, comboboxes, and attendees for unified grid
      const groupSections: Section[] = [];
      this.attendeeGroups.forEach(group => {
        // Add row for group title
        groupSections.push({
          id: `group-title-${group.key}`,
          name: group.title,
          isSpacer: true,
          isVisible: true,
          rowType: 'group-title',
          groupKey: group.key
        });

        // Add row for combobox
        groupSections.push({
          id: `combobox-${group.key}`,
          name: '',
          isSpacer: true,
          isVisible: true,
          rowType: 'combobox',
          groupKey: group.key
        });

        // Add attendee rows
        group.attendees.forEach(attendee => {
          const section = this.attendeeToSection(attendee);
          section.rowType = 'attendee';
          section.groupKey = group.key;
          groupSections.push(section);
        });
      });
      this.sections = groupSections;
    }

    getFilteredAttendees(groupKey: string): Attendee[] {
      return this.availableAttendees.filter(a => !a.type || a.type === groupKey);
    }

    getAsyncConfigForGroup(groupKey: string): any {
      const config = this.attendeeGroupConfigs.find(cfg => cfg.key === groupKey);
      if (!config || !config.apiUrl) return undefined;

      return {
        apiUrl: config.apiUrl,
        queryParamName: config.queryParamName ?? 'q',
        responseDataPath: config.responseDataPath ?? '',
        debounceMs: 300,
        timeoutMs: 10000
      };
    }

    onAttendeeSelected(groupKey: string, attendee: Attendee): void {
      const group = this.attendeeGroups.find(g => g.key === groupKey);
      if (!group) return;

      // Avoid duplicates
      if (group.attendees.find(a => a.id === attendee.id)) {
        // Show feedback for duplicate attempt
        console.warn(`Attendee "${attendee.displayName}" is already in the ${group.title} group`);
        return;
      }

      // Add to group's attendee list immutably
      group.attendees = [...group.attendees, attendee];

      // Rebuild sections and refresh view
      this.rebuildSectionsFromGroups();
      this.refreshView();

      // Notify container application about the selection
      this.attendeeSelected.emit({ groupKey, attendee });
    }

    removeAttendeeFromGroup(groupKey: string, attendeeId: string | number): void {
      const group = this.attendeeGroups.find(g => g.key === groupKey);
      if (!group) return;
      group.attendees = group.attendees.filter(a => a.id !== attendeeId);

      // Rebuild sections and refresh view
      this.rebuildSectionsFromGroups();
      this.refreshView();
    }

    private generateSampleEventsForAttendee(attendee: Attendee): void {
      // DISABLED: Auto-generated sample events removed per user request
      // This method is kept for backward compatibility but is no longer called
      /*
      // Create 2-3 sample events for the new attendee spread across the visible period
      const now = this.start || moment().startOf('day');
      const eventCount = 2 + Math.floor(Math.random() * 2); // 2-3 events
      const attendeeId = String(attendee.id);

      for (let i = 0; i < eventCount; i++) {
        const eventStart = now.clone().add(i * 6, 'hours').add(Math.random() * 4, 'hours');
        const eventEnd = eventStart.clone().add(1 + Math.random() * 1.5, 'hours');

        const eventId = `event-${attendeeId}-${Date.now()}-${i}`;
        const statuses = ['busy', 'tentative', 'free'];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

        const newItem: Item = {
          id: eventId as any,
          sectionID: attendeeId,
          name: `${attendee.displayName}'s Event ${i + 1}`,
          start: eventStart,
          end: eventEnd,
          status: randomStatus as AvailabilityStatus,
          organizer: attendee.displayName,
          attendeeResponse: 'accepted',
          classes: ''
        };

        this.items = [...this.items, newItem];
      }
      */
    }

    private attendeeToSection(a: Attendee): Section {
      return {
        id: String(a.id),
        name: a.displayName,
        email: a.email,
        tooltip: a.email || a.displayName,
        isVisible: true,
        type: 'attendee'
      } as Section;
    }
  currentTimeIndicatorPosition!: string;
  currentTimeVisibility = 'visible';
  currentTimeTitle!: string;
  ShowCurrentTimeHandle: ReturnType<typeof setTimeout> | null = null;
  SectionLeftMeasure = '0';
  currentPeriod!: Period;
  currentPeriodMinuteDiff = 0;
  header!: Header[];
  sectionItems!: SectionItem[];
  subscription = new Subscription();
  Math = Math;

  constructor(
    private changeDetector: ChangeDetectorRef,
    private service: NgxTimeSchedulerService,
    private localizationService: LocalizationService,
    private translateService: TranslateService
  ) {
    moment.locale(this.locale);
  }

  ngOnInit(): void {
    // Initialize localization
    this.initializeLocalization();
    
    this.initializeAttendeeGroups();
    this.setSectionsInSectionItems();
    this.changePeriod(this.periods[0], false);
    this.itemPush();
    this.itemPop();
    this.itemRemove();
    this.sectionPush();
    this.sectionPop();
    this.sectionRemove();
    this.refresh();
    this.updatePeriod();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // React to changes in language
    if (changes['language'] && !changes['language'].firstChange) {
      this.localizationService.setLanguage(this.language).subscribe(() => {
        this.updateLocalization();
      });
    }

    // React to changes in the start input
    if (changes['start'] && !changes['start'].firstChange) {
      // Recalculate the period when start date changes
      if (this.currentPeriod) {
        this.changePeriod(this.currentPeriod, false);
      }
    }

    // React to changes in initialAttendeeGroups
    if (changes['initialAttendeeGroups'] && !changes['initialAttendeeGroups'].firstChange) {
      this.initializeAttendeeGroups();
      this.refreshView();
    }
  }

  /**
   * Initialize localization settings
   */
  private initializeLocalization(): void {
    this.localizationService.setLanguage(this.language).subscribe(() => {
      this.updateLocalization();
    });
  }

  /**
   * Update localization based on current language
   */
  private updateLocalization(): void {
    this.isRTL = this.localizationService.isRTL();
    this.textDirection = this.localizationService.getDirection();
    
    // Set moment locale based on language
    if (this.language) {
      moment.locale(this.language);
    }
    
    // Trigger change detection
    this.changeDetector.detectChanges();
  }

  toggleSectionVisibility(section: Section): void {
    section.isVisible = section.isVisible !== false ? false : true;
    this.refreshView();
  }

  refreshView() {
    this.setSectionsInSectionItems();
    this.changePeriod(this.currentPeriod, false);
  }

  trackByFn(index: number, item: any) {
    // Prefer stable ids when available to avoid rendering glitches
    return (item && (item.id ?? item.section?.id ?? item.displayName)) ?? index;
  }

  syncSchedulerScroll(event: Event): void {
    if (this.isScrolling) return;
    this.isScrolling = true;

    const attendeeElement = event.target as HTMLElement;
    if (this.schedulerContentElement) {
      this.schedulerContentElement.nativeElement.scrollTop = attendeeElement.scrollTop;
    }

    setTimeout(() => this.isScrolling = false, 10);
  }

  syncAttendeeScroll(event: Event): void {
    if (this.isScrolling) return;
    this.isScrolling = true;

    const schedulerElement = event.target as HTMLElement;
    if (this.attendeeRowsElement) {
      this.attendeeRowsElement.nativeElement.scrollTop = schedulerElement.scrollTop;
    }

    setTimeout(() => this.isScrolling = false, 10);
  }

  // Unified grid scroll handler - syncs horizontal scroll with header via transform
  onUnifiedScroll(event: Event): void {
    const unifiedElement = event.target as HTMLElement;
    if (this.timeHeaderInnerElement) {
      const headerInner = this.timeHeaderInnerElement.nativeElement as HTMLElement;
      headerInner.style.transform = `translateX(${-unifiedElement.scrollLeft}px)`;
    }
  }

  // Helper to determine if this is the first attendee in a section (for separator rendering)
  isFirstAttendeeInSection(sectionItem: SectionItem): boolean {
    // Show separators for all attendee rows, not just the first one
    return sectionItem.rowType === 'attendee';
  }

    getStatusLabel(status?: string): string {
      switch(status) {
        case 'busy': return 'Busy';
        case 'free': return 'Free';
        case 'tentative': return 'Tentative';
        case 'out-of-office': return 'Out of Office';
        case 'working-elsewhere': return 'Working Elsewhere';
        case 'unknown': return 'Unknown';
        default: return 'Busy';
      }
    }

    getTotalTimeSlots(): number {
    // Return the number of time slots in the last header row (time slots row)
    // Each header detail has a colspan that represents how many slots it spans
    if (!this.header || this.header.length === 0) {
      return 1;
    }

    const lastHeaderRow = this.header[this.header.length - 1];
    const totalSlots = lastHeaderRow.headerDetails.reduce((sum, detail) => sum + (detail.colspan || 1), 0);
    return totalSlots;
  }

  getSelectionStyle() {
    if (!this.selectedFromTime || !this.selectedToTime) {
      return null;
    }

    // Convert to moment objects if needed
    let fromMoment: Moment;
    let toMoment: Moment;

    // If it's already a moment object, use it directly
    if (this.selectedFromTime && 'isSame' in this.selectedFromTime) {
      fromMoment = this.selectedFromTime as Moment;
    } else {
      // Otherwise treat as Date and convert
      fromMoment = moment_(this.selectedFromTime);
    }

    if (this.selectedToTime && 'isSame' in this.selectedToTime) {
      toMoment = this.selectedToTime as Moment;
    } else {
      toMoment = moment_(this.selectedToTime);
    }

    // Check if selection is within current view
    if (fromMoment.isAfter(this.end) || toMoment.isBefore(this.start)) {
      return null;
    }

    // Calculate position using pixel-based approach matching the header's 60px per slot
    // Total width = getTotalTimeSlots() * 60px
    const slotWidthPixels = 60;
    const totalSlots = this.getTotalTimeSlots();
    const leftColumnWidth = 250; // Width of the attendees column

    // Calculate left position in pixels (relative to time slots, not including the left column)
    const minutesFromStart = fromMoment.diff(this.start, 'minutes');
    const minutesPerSlot = this.currentPeriodMinuteDiff / totalSlots;
    const timeSlotLeftPixels = (minutesFromStart / minutesPerSlot) * slotWidthPixels;
    const leftPixels = leftColumnWidth + timeSlotLeftPixels;

    // Calculate width in pixels
    const durationMinutes = Math.abs(toMoment.diff(fromMoment, 'minutes'));
    const widthPixels = (durationMinutes / minutesPerSlot) * slotWidthPixels;

    // Clamp width to not exceed the period end
    const maxRightPixels = leftColumnWidth + (this.currentPeriodMinuteDiff / minutesPerSlot) * slotWidthPixels;
    const finalWidth = Math.min(widthPixels, maxRightPixels - leftPixels);

    // For RTL, calculate right position instead of left
    // In RTL, timeSlotLeftPixels becomes the right position directly
    if (this.isRTL) {
      return {
        right: (leftColumnWidth + timeSlotLeftPixels) + 'px',
        left: undefined,
        width: finalWidth + 'px'
      };
    }

    return {
      left: leftPixels + 'px',
      right: undefined,
      width: finalWidth + 'px'
    };
  }

  getEventStyle(itemMeta: ItemMeta, rowHeight: number) {
    // Calculate position using pixel-based approach matching the header's 60px per slot
    const slotWidthPixels = 60;
    const totalSlots = this.getTotalTimeSlots();
    const minutesPerSlot = this.currentPeriodMinuteDiff / totalSlots;

    // Calculate left position in pixels
    const leftMinuteDiff = itemMeta.item.start.diff(this.start, 'minutes');
    const leftPixels = (leftMinuteDiff / minutesPerSlot) * slotWidthPixels;

    // Calculate width in pixels
    const durationMinutes = Math.abs(itemMeta.item.start.diff(itemMeta.item.end, 'minutes'));
    const widthPixels = (durationMinutes / minutesPerSlot) * slotWidthPixels;

    // For RTL, calculate right position instead of left
    // In RTL, the timeline flows right-to-left, so leftPixels becomes rightPixels directly
    if (this.isRTL) {
      return {
        right: leftPixels + 'px',
        left: undefined,
        width: widthPixels + 'px',
        height: 'calc(100% - 8px)',
        top: '4px'
      };
    }

    return {
      left: leftPixels + 'px',
      right: undefined,
      width: widthPixels + 'px',
      height: 'calc(100% - 8px)',
      top: '4px'
    };
  }

  setSectionsInSectionItems() {
    this.sectionItems = new Array<SectionItem>();
    this.sections.forEach(section => {
      const perSectionItem = new SectionItem();
      perSectionItem.section = section;
      perSectionItem.rowType = section.rowType;
      perSectionItem.groupKey = section.groupKey;

      // Set group title for group-title rows
      if (section.rowType === 'group-title') {
        const group = this.attendeeGroups.find(g => g.key === section.groupKey);
        perSectionItem.groupTitle = group ? group.title : section.name;
      }

      // Set appropriate height based on row type
      if (section.rowType === 'group-title') {
        perSectionItem.minRowHeight = 30;
      } else if (section.rowType === 'combobox') {
        perSectionItem.minRowHeight = 30;
      } else {
        perSectionItem.minRowHeight = this.minRowHeight;
      }

      this.sectionItems.push(perSectionItem);
    });
  }

  setItemsInSectionItems() {
    const itemMetas = new Array<ItemMeta>();

    this.sectionItems.forEach(ele => {
      ele.itemMetas = new Array<ItemMeta>();
      ele.minRowHeight = this.minRowHeight;

      this.items.filter(i => {
        let itemMeta = new ItemMeta();

        if (i.sectionID === ele.section.id) {
          itemMeta.item = i;
          if (itemMeta.item.start <= this.end && itemMeta.item.end >= this.start) {
            itemMeta = this.itemMetaCal(itemMeta);
            ele.itemMetas.push(itemMeta);
            itemMetas.push(itemMeta);
          }
        }
      });
    });

    const sortedItems = itemMetas.reduce((sortItems: { [key: number]: ItemMeta[] }, itemMeta: ItemMeta) => {
      const index = this.sectionItems.findIndex(sectionItem => sectionItem.section.id === itemMeta.item.sectionID);
      if (!sortItems[index]) {
        sortItems[index] = [];
      }
      sortItems[index].push(itemMeta);
      return sortItems;
    }, {});

    this.calCssTop(sortedItems);
  }

  itemMetaCal(itemMeta: ItemMeta) {
    const foundStart = moment.max(itemMeta.item.start, this.start);
    const foundEnd = moment.min(itemMeta.item.end, this.end);

    let widthMinuteDiff = Math.abs(foundStart.diff(foundEnd, 'minutes'));
    let leftMinuteDiff = foundStart.diff(this.start, 'minutes');
    if (this.showBusinessDayOnly) {
      widthMinuteDiff -= (this.getNumberOfWeekendDays(moment(foundStart), moment(foundEnd)) * this.currentPeriod.timeFramePeriod);
      leftMinuteDiff -= (this.getNumberOfWeekendDays(moment(this.start), moment(foundStart)) * this.currentPeriod.timeFramePeriod);
    }

    itemMeta.cssLeft = (leftMinuteDiff / this.currentPeriodMinuteDiff) * 100;
    itemMeta.cssWidth = (widthMinuteDiff / this.currentPeriodMinuteDiff) * 100;

    if (itemMeta.item.start >= this.start) {
      itemMeta.isStart = true;
    }
    if (itemMeta.item.end <= this.end) {
      itemMeta.isEnd = true;
    }

    return itemMeta;
  }

  calCssTop(sortedItems: { [key: number]: ItemMeta[] }) {
    for (const prop of Object.keys(sortedItems)) {
      const propKey = parseInt(prop, 10);
      for (let i = 0; i < sortedItems[propKey].length; i++) {
        let elemBottom;
        const elem = sortedItems[propKey][i];

        for (let prev = 0; prev < i; prev++) {
          const prevElem = sortedItems[propKey][prev];
          const prevElemBottom = prevElem.cssTop + this.minRowHeight;
          elemBottom = elem.cssTop + this.minRowHeight;

          if ((
            (prevElem.item.start <= elem.item.start && elem.item.start <= prevElem.item.end) ||
            (prevElem.item.start <= elem.item.end && elem.item.end <= prevElem.item.end) ||
            (prevElem.item.start >= elem.item.start && elem.item.end >= prevElem.item.end)
          ) && (
            (prevElem.cssTop <= elem.cssTop && elem.cssTop <= prevElemBottom) ||
            (prevElem.cssTop <= elemBottom && elemBottom <= prevElemBottom)
          )) {
            elem.cssTop = prevElemBottom + 1;
            prev = 0;
          }
        }

        elemBottom = elem.cssTop + this.minRowHeight + 1;
        if (this.sectionItems[Number(prop)] && elemBottom > this.sectionItems[Number(prop)].minRowHeight) {
          this.sectionItems[Number(prop)].minRowHeight = elemBottom;
        }
      }
    }
  }

  changePeriod(period: Period, userTrigger: boolean = true) {
    this.currentPeriod = period;
    const _start = this.start;
    // Calculate end without endOf('day') to avoid including an extra day
    // For 3-day (4320 min) period starting Dec 11 00:00, end should be Dec 14 00:00, not Dec 14 23:59
    this.end = moment(_start).add(this.currentPeriod.timeFrameOverall, 'minutes');
    this.currentPeriodMinuteDiff = Math.abs(this.start.diff(this.end, 'minutes'));

    if (userTrigger && this.events.PeriodChange) {
      this.events.PeriodChange(this.start, this.end);
    }

    if (this.showBusinessDayOnly) {
      this.currentPeriodMinuteDiff -=
        (this.getNumberOfWeekendDays(moment(this.start), moment(this.end)) * this.currentPeriod.timeFramePeriod);
    }

    this.header = new Array<Header>();
    this.currentPeriod.timeFrameHeaders.forEach((ele: string, index: number) => {
      this.header.push(this.getDatesBetweenTwoDates(ele, index));
    });

    this.setItemsInSectionItems();
    this.showCurrentTimeIndicator();
  }

  showCurrentTimeIndicator = () => {
    if (this.ShowCurrentTimeHandle) {
      clearTimeout(this.ShowCurrentTimeHandle);
    }

    const currentTime = moment();
    if (currentTime >= this.start && currentTime <= this.end) {
      this.currentTimeVisibility = 'visible';
      this.currentTimeIndicatorPosition = (
        (Math.abs(this.start.diff(currentTime, 'minutes')) / this.currentPeriodMinuteDiff) * 100
      ) + '%';
      this.currentTimeTitle = currentTime.format(this.currentTimeFormat);
    } else {
      this.currentTimeVisibility = 'hidden';
    }
    this.ShowCurrentTimeHandle = window.setTimeout(() => this.showCurrentTimeIndicator(), 30000) as any;
  }

  gotoToday() {
    this.start = moment().startOf('day');
    this.changePeriod(this.currentPeriod);
  }

  nextPeriod() {
    this.start.add(this.currentPeriod.timeFrameOverall, 'minutes');
    this.changePeriod(this.currentPeriod);
  }

  previousPeriod() {
    this.start.subtract(this.currentPeriod.timeFrameOverall, 'minutes');
    this.changePeriod(this.currentPeriod);
  }

  gotoDate(event: any) {
    this.showGotoModal = false;
    this.start = moment(event).startOf('day');
    this.changePeriod(this.currentPeriod);
  }

  getDatesBetweenTwoDates(format: string, index: number): Header {
    const now = moment(this.start);
    const dates = new Header();
    let prev: string | undefined;
    let colspan = 0;

    while (now.isBefore(this.end)) {
      if (!this.showBusinessDayOnly || (now.day() !== 0 && now.day() !== 6)) {
        const headerDetails = new HeaderDetails();
        headerDetails.name = now.locale(this.locale).format(format);
        if (prev && prev !== headerDetails.name) {
          colspan = 1;
        } else {
          colspan++;
          dates.headerDetails.pop();
        }
        prev = headerDetails.name;
        headerDetails.colspan = colspan;
        headerDetails.tooltip = this.currentPeriod.timeFrameHeadersTooltip && this.currentPeriod.timeFrameHeadersTooltip[index] ?
          now.locale(this.locale).format(this.currentPeriod.timeFrameHeadersTooltip[index]) : '';
        dates.headerDetails.push(headerDetails);
      }
      now.add(this.currentPeriod.timeFramePeriod, 'minutes');
    }
    return dates;
  }

  getNumberOfWeekendDays(startDate: moment.Moment, endDate: moment.Moment) {
    let count = 0;
    while (startDate.isBefore(endDate) || startDate.isSame(endDate)) {
      if ((startDate.day() === 0 || startDate.day() === 6)) {
        count++;
      }
      startDate.add(this.currentPeriod.timeFramePeriod, 'minutes');
    }
    return count;
  }

  drop(event: CdkDragDrop<Section>) {
    event.item.data.sectionID = event.container.data.id;
    this.refreshView();
    this.events.ItemDropped(event.item.data);
  }

  itemPush() {
    this.subscription.add(this.service.itemAdd.asObservable().subscribe((item: Item) => {
      this.items.push(item);
      this.refreshView();
    }));
  }

  itemPop() {
    this.subscription.add(this.service.item.asObservable().subscribe(() => {
      this.items.pop();
      this.refreshView();
    }));
  }

  itemRemove() {
    this.subscription.add(this.service.itemId.asObservable().subscribe((itemId: number) => {
      this.items.splice(this.items.findIndex((item) => {
        return item.id === itemId;
      }), 1);
      this.refreshView();
    }));
  }

  sectionPush() {
    this.subscription.add(this.service.sectionAdd.asObservable().subscribe((section: Section) => {
      this.sections.push(section);
      this.refreshView();
    }));
  }

  sectionPop() {
    this.subscription.add(this.service.section.asObservable().subscribe(() => {
      this.sections.pop();
      this.refreshView();
    }));
  }

  sectionRemove() {
    this.subscription.add(this.service.sectionId.asObservable().subscribe((sectionId: string) => {
      this.sections.splice(this.sections.findIndex((section) => {
        return section.id === sectionId;
      }), 1);
      this.refreshView();
    }));
  }

  updatePeriod() {
    this.subscription.add(this.service.changePeriodSub.asObservable().subscribe((start : Moment) => {
      this.gotoDate(start);
      this.changePeriod(this.currentPeriod);
    }));
  }

  refresh() {
    this.subscription.add(this.service.refreshView.asObservable().subscribe(() => {
      this.refreshView();
    }));
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
