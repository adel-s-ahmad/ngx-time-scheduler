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

  from: Date = new Date();
  startScheduler: moment.Moment = moment();
  selectedFromTime: Date = null;
  selectedToTime: Date = null;
  selectedFromTimeMoment: moment.Moment = null;
  selectedToTimeMoment: moment.Moment = null;

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

    this.sections = [
      {
        name: 'Sarah Johnson',
        id: '1',
        email: 'sarah.johnson@company.com',
        type: 'attendee',
        isVisible: true
      }, {
        name: 'Michael Chen',
        id: '2',
        email: 'michael.chen@company.com',
        type: 'attendee',
        isVisible: true
      }, {
        name: 'Emma Davis',
        id: '3',
        email: 'emma.davis@company.com',
        type: 'attendee',
        isVisible: true
      }, {
        name: 'Conference Room A',
        id: '4',
        email: 'confroom.a@company.com',
        type: 'room',
        isVisible: true
      }, {
        name: 'Alex Rodriguez',
        id: '5',
        email: 'alex.rodriguez@company.com',
        type: 'attendee',
        isVisible: true
      }];

    // Sample events with different availability statuses
    this.items = [
      {
        id: 1,
        sectionID: '1',
        name: 'Team Standup',
        start: moment().add(0, 'hours').startOf('hour').add(9, 'hours'),
        end: moment().add(0, 'hours').startOf('hour').add(9, 'hours').add(30, 'minutes'),
        status: AvailabilityStatus.BUSY,
        organizer: 'Manager',
        attendeeResponse: 'accepted',
        classes: ''
      },
      {
        id: 2,
        sectionID: '2',
        name: 'Team Standup',
        start: moment().add(0, 'hours').startOf('hour').add(9, 'hours'),
        end: moment().add(0, 'hours').startOf('hour').add(9, 'hours').add(30, 'minutes'),
        status: AvailabilityStatus.BUSY,
        organizer: 'Manager',
        attendeeResponse: 'accepted',
        classes: ''
      },
      {
        id: 3,
        sectionID: '3',
        name: 'Team Standup',
        start: moment().add(0, 'hours').startOf('hour').add(9, 'hours'),
        end: moment().add(0, 'hours').startOf('hour').add(9, 'hours').add(30, 'minutes'),
        status: AvailabilityStatus.BUSY,
        organizer: 'Manager',
        attendeeResponse: 'accepted',
        classes: ''
      },
      {
        id: 4,
        sectionID: '4',
        name: 'Team Standup',
        start: moment().add(0, 'hours').startOf('hour').add(9, 'hours'),
        end: moment().add(0, 'hours').startOf('hour').add(9, 'hours').add(30, 'minutes'),
        status: AvailabilityStatus.BUSY,
        organizer: 'Manager',
        attendeeResponse: 'accepted',
        classes: ''
      },
      {
        id: 5,
        sectionID: '1',
        name: 'Project Planning',
        start: moment().add(0, 'hours').startOf('hour').add(10, 'hours'),
        end: moment().add(0, 'hours').startOf('hour').add(11, 'hours').add(30, 'minutes'),
        status: AvailabilityStatus.BUSY,
        organizer: 'Product Manager',
        attendeeResponse: 'tentative',
        classes: ''
      },
      {
        id: 6,
        sectionID: '2',
        name: 'Client Presentation',
        start: moment().add(0, 'hours').startOf('hour').add(14, 'hours'),
        end: moment().add(0, 'hours').startOf('hour').add(15, 'hours'),
        status: AvailabilityStatus.BUSY,
        organizer: 'Sales Director',
        attendeeResponse: 'accepted',
        classes: ''
      },
      {
        id: 7,
        sectionID: '3',
        name: 'Code Review',
        start: moment().add(0, 'hours').startOf('hour').add(13, 'hours'),
        end: moment().add(0, 'hours').startOf('hour').add(13, 'hours').add(45, 'minutes'),
        status: AvailabilityStatus.BUSY,
        organizer: 'Tech Lead',
        attendeeResponse: 'accepted',
        classes: ''
      },
      {
        id: 8,
        sectionID: '5',
        name: 'One-on-One',
        start: moment().add(0, 'hours').startOf('hour').add(15, 'hours'),
        end: moment().add(0, 'hours').startOf('hour').add(15, 'hours').add(15, 'minutes'),
        status: AvailabilityStatus.BUSY,
        organizer: 'Manager',
        attendeeResponse: 'pending',
        classes: ''
      },
      {
        id: 9,
        sectionID: '1',
        name: 'Out of Office',
        start: moment().add(1, 'days').startOf('day').add(9, 'hours'),
        end: moment().add(2, 'days').endOf('day'),
        status: AvailabilityStatus.BUSY,
        organizer: 'System',
        attendeeResponse: 'blocked',
        classes: ''
      },
      {
        id: 10,
        sectionID: '4',
        name: 'Available',
        start: moment().add(0, 'hours').startOf('hour').add(12, 'hours'),
        end: moment().add(0, 'hours').startOf('hour').add(13, 'hours'),
        status: AvailabilityStatus.BUSY,
        organizer: 'System',
        attendeeResponse: 'free',
        classes: ''
      }
    ];

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
