# Quick Start Guide - Outlook Scheduling Assistant

## 🚀 Getting Started in 5 Minutes

### 1. Install & Build

```bash
# Install dependencies
npm install

# Build the library
npm run build-lib

# Build the testing app
ng build testing-app

# Run the development server
npm start
```

### 2. Basic Component Usage

```typescript
import { Component } from '@angular/core';
import { AvailabilityStatus, NgxTimeSchedulerModule } from 'ngx-scheduler';
import moment from 'moment';

@Component({
  selector: 'app-scheduler',
  template: `
    <ngx-ts
      [items]="items"
      [periods]="periods"
      [sections]="sections"
      [start]="startDate"
    ></ngx-ts>
  `,
  imports: [NgxTimeSchedulerModule]
})
export class SchedulerComponent {
  startDate = moment().startOf('day');
  
  periods = [
    {
      name: '1 Week',
      timeFramePeriod: 60,
      timeFrameOverall: 1440 * 7,
      timeFrameHeaders: ['ddd DD', 'HH:mm']
    }
  ];

  sections = [
    {
      name: 'Alice Johnson',
      id: '1',
      email: 'alice@company.com',
      type: 'attendee' as const,
      isVisible: true
    }
  ];

  items = [
    {
      id: 1,
      name: 'Team Standup',
      sectionID: '1',
      start: moment().hour(9),
      end: moment().hour(9).minute(30),
      status: AvailabilityStatus.BUSY,
      organizer: 'Manager'
    }
  ];
}
```

### 3. Add Event Handlers

```typescript
export class SchedulerComponent {
  events = new Events();

  ngOnInit() {
    // Handle when user clicks an event
    this.events.ItemClicked = (item: Item) => {
      console.log('Clicked:', item.name);
      // Open event details modal
    };

    // Handle when period changes
    this.events.PeriodChange = (start: moment.Moment, end: moment.Moment) => {
      console.log(`Period changed: ${start.format()} to ${end.format()}`);
      // Fetch events for new period
    };
  }
}
```

## 🎨 Color Reference

Use these status values for events:

```typescript
// Status color codes
const statusColors = {
  'free': '#107c10',           // Green
  'busy': '#e81123',           // Red
  'tentative': '#ffb900',      // Yellow
  'out-of-office': '#7030a0',  // Purple
  'working-elsewhere': '#0078d4', // Blue
  'unknown': '#a4a4a4'         // Gray
};

// Usage in items
items = [{
  status: AvailabilityStatus.BUSY,      // Red
  status: AvailabilityStatus.TENTATIVE, // Yellow
  status: AvailabilityStatus.OUT_OF_OFFICE, // Purple
}];
```

## 📅 Time Period Configuration

### 3 Days View
```typescript
{
  name: '3 Days',
  timeFramePeriod: 60 * 3,        // 3-hour slots
  timeFrameOverall: 60 * 24 * 3,  // 3 days total
  timeFrameHeaders: ['ddd DD MMM', 'HH:mm']
}
```

### 1 Week View
```typescript
{
  name: '1 Week',
  timeFramePeriod: 60,            // 1-hour slots
  timeFrameOverall: 1440 * 7,     // 7 days total
  timeFrameHeaders: ['ddd DD', 'HH:mm']
}
```

### 2 Weeks View
```typescript
{
  name: '2 Weeks',
  timeFramePeriod: 240,           // 4-hour slots
  timeFrameOverall: 1440 * 14,    // 14 days total
  timeFrameHeaders: ['ddd DD', 'HH:mm']
}
```

## 🎯 Common Tasks

### Toggle Attendee Visibility

```typescript
toggleAttendee(section: Section) {
  section.isVisible = !section.isVisible;
  // Component automatically updates
}
```

### Add a New Event

```typescript
addMeeting() {
  const meeting: Item = {
    id: Date.now(),
    name: 'Team Sync',
    sectionID: 'alice-1',
    start: moment().hour(10),
    end: moment().hour(11),
    status: AvailabilityStatus.BUSY,
    organizer: 'You',
    attendeeResponse: 'organizer'
  };
  
  this.items.push(meeting);
  // Or use service: this.service.itemPush(meeting);
}
```

### Navigate to Specific Date

```typescript
goToDate(date: Date) {
  this.startDate = moment(date).startOf('day');
  // Component updates automatically
}
```

### Add an Attendee

```typescript
addAttendee(name: string, email: string) {
  const attendee: Section = {
    name: name,
    id: `attendee-${Date.now()}`,
    email: email,
    type: 'attendee',
    isVisible: true
  };
  
  this.sections.push(attendee);
}
```

## 🔧 Component Inputs

```typescript
// Appearance
[showHeaderTitle]="true"           // Show date range header
[showActionButtons]="true"         // Show navigation buttons
[showCurrentTime]="true"           // Show current time indicator
[showGoto]="true"                  // Show "Go to date" button
[showToday]="true"                 // Show "Today" button

// Behavior
[allowDragging]="false"            // Enable drag-drop
[showBusinessDayOnly]="false"      // Hide weekends
[locale]="'en'"                    // Moment.js locale

// Sizing
[minRowHeight]="40"                // Pixels per attendee
[maxHeight]="'800px'"              // Max container height

// Data
[items]="items"                    // Events array
[sections]="sections"              // Attendees array
[periods]="periods"                // Time period options
[start]="startDate"                // Start date
[text]="textLabels"                // Custom labels
[events]="eventHandlers"           // Event callbacks

// Formatting
[headerFormat]="'DD MMM YYYY'"      // Date format
[currentTimeFormat]="'HH:mm:ss'"    // Time format
```

## 📊 Data Structure Examples

### Complete Item Object
```typescript
const event: Item = {
  id: 1,
  name: 'Project Review',
  sectionID: 'attendee-123',
  start: moment('2025-12-10 14:00'),
  end: moment('2025-12-10 15:00'),
  status: AvailabilityStatus.BUSY,
  organizer: 'John Manager',
  attendeeResponse: 'accepted',
  tooltip: 'Q4 Project Review Meeting',
  metadata: {
    location: 'Conference Room A',
    meetingLink: 'https://teams.microsoft.com/...',
    organizerId: 'john-123'
  },
  classes: ''
};
```

### Complete Section Object
```typescript
const attendee: Section = {
  id: 'attendee-456',
  name: 'Sarah Johnson',
  email: 'sarah.johnson@company.com',
  type: 'attendee',
  isVisible: true,
  tooltip: 'Senior Product Manager'
};

const room: Section = {
  id: 'room-789',
  name: 'Conference Room A',
  email: 'confroom-a@company.com',
  type: 'room',
  isVisible: true,
  tooltip: 'Seats 12 people, has AV equipment'
};
```

## 🎬 Real-World Example

```typescript
import { Component, OnInit } from '@angular/core';
import { Events, Item, Period, Section, Text, AvailabilityStatus, NgxTimeSchedulerService } from 'ngx-scheduler';
import moment from 'moment';

@Component({
  selector: 'app-meeting-scheduler',
  template: `
    <div class="scheduler">
      <ngx-ts
        [items]="items"
        [periods]="periods"
        [sections]="sections"
        [events]="events"
        [start]="currentDate"
        [showHeaderTitle]="true"
        [text]="labels"
      ></ngx-ts>
    </div>
  `,
  imports: [NgxTimeSchedulerModule]
})
export class MeetingSchedulerComponent implements OnInit {
  currentDate = moment().startOf('day');
  events = new Events();
  labels = new Text();

  periods: Period[] = [
    {
      name: '3 Days',
      timeFramePeriod: 180,
      timeFrameOverall: 60 * 24 * 3,
      timeFrameHeaders: ['ddd MMM DD', 'HH:mm']
    },
    {
      name: '1 Week',
      timeFramePeriod: 480,
      timeFrameOverall: 60 * 24 * 7,
      timeFrameHeaders: ['ddd DD', 'HH:mm']
    }
  ];

  sections: Section[] = [
    { id: '1', name: 'John Doe', email: 'john@company.com', type: 'attendee', isVisible: true },
    { id: '2', name: 'Jane Smith', email: 'jane@company.com', type: 'attendee', isVisible: true },
    { id: 'r1', name: 'Board Room', email: 'board@company.com', type: 'room', isVisible: true }
  ];

  items: Item[] = [
    {
      id: 1,
      name: 'All Hands',
      sectionID: '1',
      start: moment().hour(10),
      end: moment().hour(11),
      status: AvailabilityStatus.BUSY,
      organizer: 'HR'
    },
    {
      id: 2,
      name: 'Team Sync',
      sectionID: '2',
      start: moment().hour(14),
      end: moment().hour(14).minute(30),
      status: AvailabilityStatus.TENTATIVE,
      organizer: 'Manager'
    }
  ];

  constructor(private service: NgxTimeSchedulerService) {}

  ngOnInit() {
    this.labels.SectionTitle = 'Team Members';

    // Handle event clicks
    this.events.ItemClicked = (item: Item) => {
      this.openEventDetails(item);
    };

    // Handle period changes
    this.events.PeriodChange = (start, end) => {
      console.log(`Viewing: ${start.format('YYYY-MM-DD')} to ${end.format('YYYY-MM-DD')}`);
    };
  }

  openEventDetails(item: Item) {
    alert(`Event: ${item.name}\nOrganizer: ${item.organizer}\nStatus: ${item.status}`);
  }

  scheduleNewMeeting() {
    const newMeeting: Item = {
      id: Date.now(),
      name: 'One-on-One',
      sectionID: '1',
      start: moment().hour(15),
      end: moment().hour(15).minute(30),
      status: AvailabilityStatus.BUSY,
      organizer: 'You'
    };
    this.items.push(newMeeting);
  }
}
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Events not showing | Verify `sectionID` matches a section `id` |
| Attendees hidden | Check `isVisible` property or checkbox in sidebar |
| Wrong dates showing | Ensure moment.js is properly imported and locale set |
| Styling looks wrong | Check Angular ViewEncapsulation settings |
| Slow performance | Reduce number of time periods or items |

## 📖 Documentation Links

- Full documentation: See `OUTLOOK_STYLE_CHANGES.md`
- Examples: See `testing-app` component
- API Reference: See ngx-scheduler models

## ✨ Tips & Tricks

1. **Keyboard Navigation**: Arrow keys navigate time periods
2. **Custom Colors**: Add `classes` property to items for custom styling
3. **Tooltips**: Add `tooltip` property to items and sections
4. **Metadata**: Store additional data in `metadata` object
5. **Locale**: Change language with `[locale]="'de'"` or other moment locales

## 🚀 Deploy & Production

```bash
# Build for production
ng build testing-app --configuration production

# Build library for npm
npm run build-lib

# Pack library
npm run pack-lib

# Publish to npm
npm publish dist/ngx-scheduler
```

---

**Need help?** Check the full documentation in `OUTLOOK_STYLE_CHANGES.md` or the testing app for working examples.
