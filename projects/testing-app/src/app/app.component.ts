import {Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import 'moment/locale/ar';  // Import Arabic locale for moment.js
import { Events, Item, NgxTimeSchedulerComponent, NgxTimeSchedulerService, Period, Section, Text, type Attendee } from '@adelsoli/ngx-scheduler';

// Customize Arabic locale to use English numerals but keep Arabic day/month names
moment.updateLocale('ar', {
  preparse: (string: string) => string,
  postformat: (string: string) => string
});

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgxTimeSchedulerComponent, FormsModule, DatePipe, TranslateModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css', './app-rtl.css']
})
export class AppComponent {
  events: Events = new Events();
  periods: Period[] = [];
  sections: Section[] = [];
  items: Item[] = [];
  txt: Text = new Text();

  // Localization properties
  currentLanguage = 'ar';
  supportedLanguages = ['en', 'ar'];
  textDirection: 'ltr' | 'rtl' = 'ltr';
  showEventTitles = true; // Privacy/security toggle

  // Inline attendee add test data
  attendeeGroupConfigs = [
    { key: 'contacts', title: 'Contacts', apiUrl: '/api/contacts', queryParamName: 'q', responseDataPath: 'data' },
    { key: 'users', title: 'Users', apiUrl: '/api/users', queryParamName: 'q', responseDataPath: 'data' },
    { key: 'rooms', title: 'Rooms', apiUrl: '/api/rooms', queryParamName: 'q', responseDataPath: 'data' }
  ];

  availableAttendees = [
    { id: 'c1', displayName: 'Ava Parker', email: 'ava.parker@company.com', type: 'contacts' },
    { id: 'c2', displayName: 'Noah Lee', email: 'noah.lee@company.com', type: 'contacts' },
    { id: 'u1', displayName: 'Sarah Johnson', email: 'sarah.johnson@company.com', type: 'users' },
    { id: 'u2', displayName: 'Michael Chen', email: 'michael.chen@company.com', type: 'users' },
    { id: 'u3', displayName: 'Emma Davis', email: 'emma.davis@company.com', type: 'users' },
    { id: 'r1', displayName: 'Conference Room A', email: 'confroom.a@company.com', type: 'rooms' },
    { id: 'r2', displayName: 'Zoom Room West', email: 'zoom.west@company.com', type: 'rooms' }
  ];

  initialAttendeeGroups = [
    { key: 'contacts', title: 'Contacts', attendees: [{ id: 'c1', displayName: 'Ava Parker', email: 'ava.parker@company.com', type: 'contacts' }] },
    { key: 'users', title: 'Users', attendees: [{ id: 'u1', displayName: 'Sarah Johnson', email: 'sarah.johnson@company.com', type: 'users' }] },
    { key: 'rooms', title: 'Rooms', attendees: [{ id: 'r1', displayName: 'Conference Room A', email: 'confroom.a@company.com', type: 'rooms' }] }
  ];

  from: Date = new Date();
  startScheduler: moment.Moment = moment();
  selectedFromTime: Date | null = null;
  selectedToTime: Date | null = null;
  selectedFromTimeMoment: moment.Moment | null = null;
  selectedToTimeMoment: moment.Moment | null = null;
  lastSelectedAttendee: Attendee | null = null;
  lastSelectedGroupKey: string | null = null;

  constructor(private service: NgxTimeSchedulerService, private translateService: TranslateService) {
  }

  ngOnInit() {
    // Initialize translations
    this.initializeLocalization();

    // Initialize calendar to today at start of day
    this.startScheduler = moment().startOf('day');
    this.from = this.startScheduler.toDate();

    // Initialize selection times to current time and one hour forward
    this.selectedFromTimeMoment = moment();
    this.selectedToTimeMoment = moment().add(1, 'hour');
    this.selectedFromTime = this.selectedFromTimeMoment.toDate();
    this.selectedToTime = this.selectedToTimeMoment.toDate();

    // Initialize with translations after locale is set
    setTimeout(() => {
      this.updateSectionTitle();
      this.updateGroupTitles();
    }, 100);

    this.periods = [
      // {
      //   name: '3 days',
      //   timeFramePeriod: 60,
      //   timeFrameOverall: (60 * 24 * 3),
      //   timeFrameHeaders: [
      //     'ddd DD MMM',
      //     'HH:mm'
      //   ],
      //   classes: ''
      // },
      {
        name: '1 week',
        timeFrameHeaders: ['ddd DD', 'HH:mm'],
        classes: '',
        timeFrameOverall: 1440 * 7,
        timeFramePeriod: 60,
      }
      // , {
      //   name: '2 weeks',
      //   timeFrameHeaders: ['ddd DD', 'HH:mm'],
      //   classes: '',
      //   timeFrameOverall: 1440 * 14,
      //   timeFramePeriod: 60,
      // }
    ];

    // Start with no default attendees in scheduler; add via groups
    this.sections = [];

    // Sample events with different availability statuses
    // Create events for pre-selected attendees (Ava Parker, Sarah Johnson, Conference Room A)
    this.items = [
      // Ava Parker events
      {
        id: 1,
        sectionID: 'c1',
        name: 'Team Standup',
        start: moment().startOf('day').add(9, 'hours'),
        end: moment().startOf('day').add(9.5, 'hours'),
        status: 'busy' as any,
        organizer: 'Ava Parker',
        attendeeResponse: 'accepted',
        classes: ''
      } as any,
      {
        id: 2,
        sectionID: 'c1',
        name: 'Client Call',
        start: moment().startOf('day').add(14, 'hours'),
        end: moment().startOf('day').add(15, 'hours'),
        status: 'busy' as any,
        organizer: 'Ava Parker',
        attendeeResponse: 'accepted',
        classes: ''
      } as any,
      // Sarah Johnson events
      {
        id: 3,
        sectionID: 'u1',
        name: 'Design Review',
        start: moment().startOf('day').add(10, 'hours'),
        end: moment().startOf('day').add(11, 'hours'),
        status: 'busy' as any,
        organizer: 'Sarah Johnson',
        attendeeResponse: 'accepted',
        classes: ''
      } as any,
      {
        id: 4,
        sectionID: 'u1',
        name: 'Lunch Break',
        start: moment().startOf('day').add(12, 'hours'),
        end: moment().startOf('day').add(13, 'hours'),
        status: 'busy' as any,
        organizer: 'Sarah Johnson',
        attendeeResponse: 'accepted',
        classes: ''
      } as any,
      {
        id: 5,
        sectionID: 'u1',
        name: 'Project Planning',
        start: moment().startOf('day').add(15, 'hours'),
        end: moment().startOf('day').add(16.5, 'hours'),
        status: 'busy' as any,
        organizer: 'Sarah Johnson',
        attendeeResponse: 'tentative',
        classes: ''
      } as any,
      // Conference Room A events
      {
        id: 6,
        sectionID: 'r1',
        name: 'All Hands Meeting',
        start: moment().startOf('day').add(11, 'hours'),
        end: moment().startOf('day').add(12, 'hours'),
        status: 'busy' as any,
        organizer: 'Management',
        attendeeResponse: 'accepted',
        classes: ''
      } as any,
      {
        id: 7,
        sectionID: 'r1',
        name: 'Department Sync',
        start: moment().startOf('day').add(16, 'hours'),
        end: moment().startOf('day').add(17, 'hours'),
        status: 'busy' as any,
        organizer: 'Management',
        attendeeResponse: 'accepted',
        classes: ''
      } as any
    ];

    // Handle period changes from scheduler navigation
    this.events.PeriodChange = (start: moment.Moment) => {
      this.startScheduler = start.clone();
      this.from = this.startScheduler.toDate();
      console.log('Period changed to:', this.startScheduler.format('YYYY-MM-DD HH:mm'));
    };

  }

getRandomInt(min: number, max: number): number {
  min = Math.ceil(min); // Rounds up the min value to the nearest integer
  max = Math.floor(max); // Rounds down the max value to the nearest integer
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


  addItem() {
    this.service.itemPush({
      id: this.getRandomInt(1, 100),
      sectionID: 'r1',
      name: 'New Meeting',
      start: moment().startOf('day').add(16, 'hours'),
      end: moment().startOf('day').add(17, 'hours'),
      status: 'busy' as any,
      organizer: 'Me',
      attendeeResponse: 'organizer',
      classes: ''
    } as any);
  }

  addSection() {
    this.service.sectionPush({
      id: '6',
      name: 'James Wilson',
      email: 'james.wilson@company.com',
      type: 'attendee',
      isVisible: true
    } as any);
  }

  popItem() {
    this.service.itemPop();
  }

  removeItem() {
    this.service.itemRemove(1);
  }

  onFromTimeChange(event: string) {
    // Parse datetime-local input as local time
    // Format is "YYYY-MM-DDTHH:mm"
    const selectedDateTime = moment(event, 'YYYY-MM-DDTHH:mm', true);

    if (selectedDateTime.isValid()) {
      // Store the moment object directly (not as Date)
      this.selectedFromTimeMoment = selectedDateTime.clone();
      // Also update Date for form binding
      this.selectedFromTime = selectedDateTime.toDate();

      console.log('From time selected:', {
        formatted: selectedDateTime.format('YYYY-MM-DD HH:mm'),
        momentToString: selectedDateTime.toString(),
        momentUtcOffset: selectedDateTime.utcOffset(),
        momentHours: selectedDateTime.hours(),
        momentMinutes: selectedDateTime.minutes()
      });

      // Ensure from time is before to time
      if (this.selectedToTimeMoment) {
        if (selectedDateTime.isAfter(this.selectedToTimeMoment)) {
          const newToTime = selectedDateTime.clone().add(1, 'hour');
          this.selectedToTime = newToTime.toDate();
          this.selectedToTimeMoment = newToTime;
        }
      }

      // Navigate to selected date if it's outside the current visible period
      // Get the currently active period (default to first period)
      const currentPeriod = this.periods[0]; // Using first period as default
      const periodDurationMinutes = currentPeriod.timeFrameOverall;
      const schedulerEnd = this.startScheduler.clone().add(periodDurationMinutes, 'minutes');

      // Check if selected date is outside the visible range
      if (selectedDateTime.isBefore(this.startScheduler) || selectedDateTime.isAfter(schedulerEnd)) {
        // Navigate to the selected date (start of day)
        // Create a new moment instance to trigger change detection
        this.startScheduler = moment(selectedDateTime).startOf('day');
        this.from = this.startScheduler.toDate();
        console.log('Navigated to:', this.startScheduler.format('YYYY-MM-DD'));
      }
    }
  }

  onToTimeChange(event: string) {
    // Parse datetime-local input as local time
    // Format is "YYYY-MM-DDTHH:mm"
    const selectedDateTime = moment(event, 'YYYY-MM-DDTHH:mm', true);

    if (selectedDateTime.isValid()) {
      // Store the moment object directly (not as Date)
      this.selectedToTimeMoment = selectedDateTime.clone();
      // Also update Date for form binding
      this.selectedToTime = selectedDateTime.toDate();

      console.log('To time selected:', {
        formatted: selectedDateTime.format('YYYY-MM-DD HH:mm'),
        momentToString: selectedDateTime.toString(),
        momentUtcOffset: selectedDateTime.utcOffset(),
        momentHours: selectedDateTime.hours(),
        momentMinutes: selectedDateTime.minutes()
      });

      // Ensure to time is after from time
      if (this.selectedFromTimeMoment) {
        if (selectedDateTime.isBefore(this.selectedFromTimeMoment)) {
          const newFromTime = selectedDateTime.clone().subtract(1, 'hour');
          this.selectedFromTime = newFromTime.toDate();
          this.selectedFromTimeMoment = newFromTime;
        }
      }
    }
  }

  /**
   * Initialize localization settings
   */
  private initializeLocalization(): void {
    // Set default language
    this.translateService.setDefaultLang('ar');
    this.translateService.use(this.currentLanguage);
    // Set moment locale for initial language
    moment.locale(this.currentLanguage);

    // Listen for language changes and update translations
    this.translateService.onLangChange.subscribe(() => {
      this.updateSectionTitle();
      this.updateGroupTitles();
    });

    // Update document direction
    this.updateDocumentDirection();
  }

  /**
   * Change the language of the application
   */
  changeLanguage(language: string): void {
    if (this.supportedLanguages.includes(language)) {
      this.currentLanguage = language;
      // Set moment locale FIRST before anything else
      moment.locale(language);
      this.translateService.use(language);
      this.updateDocumentDirection();
      // updateGroupTitles will be called automatically via onLangChange subscription
      // After a brief delay to ensure translations are fully loaded
      setTimeout(() => {
        this.updateGroupTitles();
      }, 50);
    }
  }

  /**
   * Update document direction based on current language
   */
  private updateDocumentDirection(): void {
    const rtlLanguages = ['ar', 'fa', 'ur'];
    const isRtl = rtlLanguages.includes(this.currentLanguage);
    this.textDirection = isRtl ? 'rtl' : 'ltr';

    // Update HTML and body element
    const htmlElement = document.documentElement;
    htmlElement.lang = this.currentLanguage;
    htmlElement.dir = this.textDirection;
    document.body.dir = this.textDirection;
  }

  /**
   * Update section title with translation
   */
  private updateSectionTitle(): void {
    this.translateService.get('scheduler.labels.attendees').subscribe(res => {
      this.txt.SectionTitle = res;
    });
  }

  /**
   * Update group titles with translations
   */
  private updateGroupTitles(): void {
    // Get all translations for group keys
    const keys = this.attendeeGroupConfigs.map(config => `app.groups.${config.key}`);
    this.translateService.get(keys).subscribe(res => {
      // Update attendeeGroupConfigs titles
      this.attendeeGroupConfigs = this.attendeeGroupConfigs.map(config => ({
        ...config,
        title: res[`app.groups.${config.key}`]
      }));

      // Update initialAttendeeGroups titles
      this.initialAttendeeGroups = this.initialAttendeeGroups.map(group => ({
        ...group,
        title: res[`app.groups.${group.key}`]
      }));
    });
  }

  // Receives selection events from the scheduler's attendee comboboxes
  onAttendeeSelected(evt: { groupKey: string; attendee: Attendee }) {
    this.lastSelectedAttendee = evt.attendee;
    this.lastSelectedGroupKey = evt.groupKey;
    console.log('Attendee selected:', evt.attendee, 'from group:', evt.groupKey);
    // TODO: trigger any additional side effects here (fetch availability, prefill form, etc.)
  }

}
