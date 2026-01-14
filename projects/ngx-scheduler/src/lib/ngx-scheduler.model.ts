import * as moment from 'moment';

export enum AvailabilityStatus {
  FREE = 'free',
  BUSY = 'busy',
  TENTATIVE = 'tentative',
  OUT_OF_OFFICE = 'out-of-office',
  WORKING_ELSEWHERE = 'working-elsewhere',
  UNKNOWN = 'unknown'
}

export class Period {
  name!: string;
  classes!: string;
  timeFramePeriod!: number;
  timeFrameOverall!: number;
  timeFrameHeaders!: string[];
  timeFrameHeadersTooltip?: string[];
  tooltip?: string;
}

export class Item {
  id!: number;
  name!: string;
  start!: moment.Moment;
  end!: moment.Moment;
  classes!: string;
  sectionID!: string;
  tooltip?: string;
  metadata?: any;
  status?: AvailabilityStatus;
  organizer?: string;
  attendeeResponse?: string;
}

export interface Attendee {
  id: string | number;
  displayName: string;
  email?: string;
  type?: 'contact' | 'user' | 'room' | string;
}

export interface AttendeeGroupConfig {
  key: string;                    // e.g., 'contacts', 'users', 'rooms'
  title: string;                  // configurable display title
  apiUrl?: string;                // optional: URL to fetch attendees from
  queryParamName?: string;         // optional: query param for search (default: 'q')
  responseDataPath?: string;       // optional: path to attendees array in response (e.g., 'data.users')
}

export interface AttendeeRemovalEvent {
  groupKey: string;               // The group from which the attendee was removed
  attendee: Attendee;             // The removed attendee
}

export interface AttendeeGroup {
  key: string;
  title: string;
  attendees: Attendee[];
}

export class Section {
  id!: string;
  name!: string;
  tooltip?: string;
  email?: string;
  isVisible?: boolean;
  type?: 'attendee' | 'room'; // attendee or room resource
  isSpacer?: boolean; // true for placeholder rows (group titles, comboboxes)
  rowType?: 'group-title' | 'combobox' | 'attendee'; // row type for unified grid
  groupKey?: string; // group key for group-title and combobox rows
}

export class Text {
  NextButton!: string;
  PrevButton!: string;
  TodayButton!: string;
  GotoButton!: string;
  SectionTitle!: string;
  HeaderTitle!: string;

  constructor() {
    this.NextButton = 'Next';
    this.PrevButton = 'Prev';
    this.TodayButton = 'Today';
    this.GotoButton = 'Go to';
    this.SectionTitle = 'Section';
    this.HeaderTitle = '';
  }
}

export class Events {
  // ItemResized: (item: Item, start: any, end: any) => void;
  // ItemMovement: (item: Item, start: any, end: any) => void;
  // ItemMovementStart: (item: Item, start: any, end: any) => void;
  // ItemMovementEnd: (item: Item, start: any, end: any) => void;
  ItemDropped!: (item: Item) => void;
  ItemClicked!: (item: Item) => void;
  ItemContextMenu!: (item: Item, event: MouseEvent) => void;
  SectionClickEvent!: (section: Section) => void;
  SectionContextMenuEvent!: (section: Section, event: MouseEvent) => void;
  PeriodChange!: (start: moment.Moment, end: moment.Moment) => void;
}

export class SectionItem {
  section!: Section;
  minRowHeight!: number;
  itemMetas: ItemMeta[];
  // For unified grid layout
  rowType?: 'group-title' | 'combobox' | 'attendee';
  groupKey?: string;
  groupTitle?: string;

  constructor() {
    this.itemMetas = new Array<ItemMeta>();
  }
}

export class ItemMeta {
  item!: Item;
  isStart!: boolean;
  isEnd!: boolean;
  cssTop: number;
  cssLeft: number;
  cssWidth: number;
  column: number;        // Which column this event occupies (0-based)
  totalColumns: number;  // Total number of overlapping events at this time

  constructor() {
    this.cssTop = 0;
    this.cssLeft = 0;
    this.cssWidth = 0;
    this.column = 0;
    this.totalColumns = 1;
  }
}

export class Header {
  headerDetails: HeaderDetails[];

  constructor() {
    this.headerDetails = new Array<HeaderDetails>();
  }
}

export class HeaderDetails {
  name!: string;
  colspan!: number;
  tooltip?: string;
}
