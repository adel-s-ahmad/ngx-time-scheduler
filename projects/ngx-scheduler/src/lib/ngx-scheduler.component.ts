import {ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, OnInit, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {CdkDragDrop} from '@angular/cdk/drag-drop';

import {
  HeaderDetails,
  Header,
  ItemMeta,
  Item,
  Period,
  SectionItem,
  Section,
  Text,
  Events
} from './ngx-scheduler.model';
import moment_, { Moment } from 'moment';
import {Subscription} from 'rxjs';
import { NgxTimeSchedulerService } from './ngx-scheduler.service';

const moment = moment_;

@Component({
  selector: 'ngx-ts[items][periods][sections]',
  templateUrl: './ngx-scheduler.component.html',
  styleUrls: ['./ngx-scheduler.component.css']
})
export class NgxTimeSchedulerComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('sectionTd') set SectionTd(elementRef: ElementRef) {
    this.SectionLeftMeasure = elementRef.nativeElement.clientWidth + 'px';
    this.changeDetector.detectChanges();
  }

  @ViewChild('attendeeRows') attendeeRowsElement: ElementRef | undefined;
  @ViewChild('schedulerContent') schedulerContentElement: ElementRef | undefined;

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
  @Input() maxHeight: string = null;
  @Input() text = new Text();
  @Input() items: Item[];
  @Input() sections: Section[];
  @Input() periods: Period[];
  @Input() events: Events = new Events();
  @Input() start = moment().startOf('day');
  @Input() selectedFromTime: moment.Moment = null;
  @Input() selectedToTime: moment.Moment = null;

  end = moment().endOf('day');
  showGotoModal = false;
  currentTimeIndicatorPosition: string;
  currentTimeVisibility = 'visible';
  currentTimeTitle: string;
  ShowCurrentTimeHandle = null;
  SectionLeftMeasure = '0';
  currentPeriod: Period;
  currentPeriodMinuteDiff = 0;
  header: Header[];
  sectionItems: SectionItem[];
  subscription = new Subscription();
  Math = Math;

  constructor(
    private changeDetector: ChangeDetectorRef,
    private service: NgxTimeSchedulerService
  ) {
    moment.locale(this.locale);
  }

  ngOnInit(): void {
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
    // React to changes in the start input
    if (changes['start'] && !changes['start'].firstChange) {
      // Recalculate the period when start date changes
      if (this.currentPeriod) {
        this.changePeriod(this.currentPeriod, false);
      }
    }
  }

  toggleSectionVisibility(section: Section): void {
    section.isVisible = section.isVisible !== false ? false : true;
    this.refreshView();
  }

  refreshView() {
    this.setSectionsInSectionItems();
    this.changePeriod(this.currentPeriod, false);
  }

  trackByFn(index, item) {
    return index;
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

    // Calculate left position in pixels
    const minutesFromStart = Math.abs(this.start.diff(fromMoment, 'minutes'));
    const minutesPerSlot = this.currentPeriodMinuteDiff / totalSlots;
    const leftPixels = (minutesFromStart / minutesPerSlot) * slotWidthPixels;

    // Calculate width in pixels
    const durationMinutes = Math.abs(fromMoment.diff(toMoment, 'minutes'));
    const widthPixels = (durationMinutes / minutesPerSlot) * slotWidthPixels;

    return {
      left: leftPixels + 'px',
      width: widthPixels + 'px'
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

    return {
      left: leftPixels + 'px',
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
      perSectionItem.minRowHeight = this.minRowHeight;
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

    const sortedItems = itemMetas.reduce((sortItems: {}, itemMeta: ItemMeta) => {
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

  calCssTop(sortedItems) {
    for (const prop of Object.keys(sortedItems)) {
      for (let i = 0; i < sortedItems[prop].length; i++) {
        let elemBottom;
        const elem = sortedItems[prop][i];

        for (let prev = 0; prev < i; prev++) {
          const prevElem = sortedItems[prop][prev];
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
    this.ShowCurrentTimeHandle = setTimeout(this.showCurrentTimeIndicator, 30000);
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
    let prev: string;
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

  getNumberOfWeekendDays(startDate, endDate) {
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
