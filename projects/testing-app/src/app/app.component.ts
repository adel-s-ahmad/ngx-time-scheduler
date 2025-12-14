import {Component, OnInit} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import moment from 'moment';
import { Events, Item, NgxTimeSchedulerModule, NgxTimeSchedulerService, Period, Section, Text, AvailabilityStatus } from 'ngx-scheduler';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgxTimeSchedulerModule, FormsModule, DatePipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  events: Events = new Events();
  periods: Period[];
  sections: Section[];
  items: Item[];
  txt: Text = new Text();

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

  constructor(private service: NgxTimeSchedulerService) {
  }

  ngOnInit() {

    this.txt.SectionTitle = 'Attendees';

    // Initialize calendar to today at start of day
    this.startScheduler = moment().startOf('day');
    this.from = this.startScheduler.toDate();

    this.periods = [
      {
        name: '3 days',
        timeFramePeriod: 60,
        timeFrameOverall: (60 * 24 * 3),
        timeFrameHeaders: [
          'ddd DD MMM',
          'HH:mm'
        ],
        classes: ''
      }, {
        name: '1 week',
        timeFrameHeaders: ['ddd DD', 'HH:mm'],
        classes: '',
        timeFrameOverall: 1440 * 7,
        timeFramePeriod: 60,
      }, {
        name: '2 weeks',
        timeFrameHeaders: ['ddd DD', 'HH:mm'],
        classes: '',
        timeFrameOverall: 1440 * 14,
        timeFramePeriod: 60,
      }];

    // Start with no default attendees in scheduler; add via groups
    this.sections = [];

    // Sample events with different availability statuses
    // Start with no default items; events appear after attendees are added
    this.items = [];

    // Handle period changes from scheduler navigation
    this.events.PeriodChange = (start: moment.Moment) => {
      this.startScheduler = start.clone();
      this.from = this.startScheduler.toDate();
      console.log('Period changed to:', this.startScheduler.format('YYYY-MM-DD HH:mm'));
    };

  }

  addItem() {
    this.service.itemPush({
      id: 11,
      sectionID: '2',
      name: 'New Meeting',
      start: moment().startOf('day').add(16, 'hours'),
      end: moment().startOf('day').add(17, 'hours'),
      status: AvailabilityStatus.BUSY,
      organizer: 'Me',
      attendeeResponse: 'organizer',
      classes: ''
    });
  }

  addSection() {
    this.service.sectionPush({
      id: '6',
      name: 'James Wilson',
      email: 'james.wilson@company.com',
      type: 'attendee',
      isVisible: true
    });
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

}
