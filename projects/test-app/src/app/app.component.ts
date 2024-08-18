import {Component, OnInit} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import moment from 'moment';
import { Events, Item, NgxTimeSchedulerModule, NgxTimeSchedulerService, Period, Section, Text } from 'ngx-scheduler';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgxTimeSchedulerModule, FormsModule],
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
  startScheduler: moment.Moment = moment().startOf('day');

  constructor(private service: NgxTimeSchedulerService) {
  }

  ngOnInit() {

    this.txt.SectionTitle = 'Attendees';

    this.periods = [
      {
        name: '3 days',
        timeFramePeriod: (60 * 3),
        timeFrameOverall: (60 * 24 * 3),
        timeFrameHeaders: [
          'Do MMM',
          'HH'
        ],
        classes: ''
      }, {
        name: '1 week',
        timeFrameHeaders: ['MMM YYYY', 'DD(ddd)'],
        classes: '',
        timeFrameOverall: 1440 * 7,
        timeFramePeriod: 1440,
      }, {
        name: '2 week',
        timeFrameHeaders: ['MMM YYYY', 'DD(ddd)'],
        classes: '',
        timeFrameOverall: 1440 * 14,
        timeFramePeriod: 1440,
      }];

    this.sections = [{
      name: 'A',
      id: 1
    }, {
      name: 'B',
      id: 2
    }, {
      name: 'C',
      id: 3
    }, {
      name: 'D',
      id: 4
    }, {
      name: 'E',
      id: 5
    }];


    this.items = [{
      id: 1,
      sectionID: 1,
      name: 'Item 1',
      start: moment().startOf('day'),
      end: moment().add(1, 'days').endOf('day'),
      classes: 'attendee-scheduler-session-style'
    }, {
      id: 2,
      sectionID: 3,
      name: 'Item 2',
      start: moment().startOf('day'),
      end: moment().add(1, 'days').endOf('day'),
      classes: 'room-scheduler-session-style'
    }, {
      id: 3,
      sectionID: 1,
      name: 'Item 3',
      start: moment().add(1, 'days').startOf('day'),
      end: moment().add(1, 'days').endOf('day'),
      classes: 'attendee-scheduler-session-style'
    }];

  }

  addItem() {
    this.service.itemPush({
      id: 4,
      sectionID: 6,
      name: 'Item 4',
      start: moment().startOf('day'),
      end: moment().add(3, 'days').endOf('day'),
      classes: ''
    });
  }

  addSection() {
    this.service.sectionPush({
      id: 6,
      name: 'F'
    });
  }

  popItem() {
    this.service.itemPop();
  }

  removeItem() {
    this.service.itemRemove(4);
  }

  updateCalendarStartDate(event) {
    console.log('changing date', event);
    this.startScheduler = moment(event).startOf('day');
    this.service.updatePeriod(this.startScheduler);
  }

}
