# Outlook Scheduling Assistant Implementation

## Overview

The ngx-scheduler library has been completely redesigned to match the **Microsoft Outlook Scheduling Assistant** interface. This transformation includes new UI/UX patterns, availability status tracking, and a modern, professional design that matches Outlook's scheduling experience.

## Key Changes

### 1. **New Data Models**

#### AvailabilityStatus Enum
```typescript
export enum AvailabilityStatus {
  FREE = 'free',                    // Available (Green)
  BUSY = 'busy',                    // Busy (Red)
  TENTATIVE = 'tentative',          // Tentative (Yellow)
  OUT_OF_OFFICE = 'out-of-office',  // Out of Office (Purple)
  WORKING_ELSEWHERE = 'working-elsewhere', // Working Elsewhere (Blue)
  UNKNOWN = 'unknown'               // Unknown (Gray)
}
```

#### Enhanced Item Model
```typescript
export class Item {
  id: number;
  name: string;
  start: moment.Moment;
  end: moment.Moment;
  classes: string;
  sectionID: string;
  tooltip?: string;
  metadata?: any;
  status?: AvailabilityStatus;      // NEW: Event availability status
  organizer?: string;               // NEW: Event organizer
  attendeeResponse?: string;        // NEW: Attendee's response status
}
```

#### Enhanced Section Model
```typescript
export class Section {
  id: string;
  name: string;
  tooltip?: string;
  email?: string;                   // NEW: Email address for attendees
  isVisible?: boolean;              // NEW: Toggle visibility in schedule
  type?: 'attendee' | 'room';       // NEW: Distinguish attendees from rooms
}
```

### 2. **New Component Features**

#### Attendees Panel
- **Left sidebar** displaying all attendees/resources
- **Checkbox controls** to toggle visibility of each attendee's schedule
- **Email display** for each attendee
- **Type indicators** (attendee vs. room resources)
- **Visual feedback** for active/inactive attendees

#### Modern Header
- **Period selector buttons** (3 days, 1 week, 2 weeks)
- **Navigation controls** (Previous, Next, Today, Go to Date)
- **Date range header** showing current view period
- **Clean, organized layout** with proper spacing

#### Time Grid Display
- **Hourly time slots** with proper formatting
- **Visual separation** between attendees
- **Event cards** with availability color coding
- **Current time indicator** with visual emphasis
- **Responsive layout** that adapts to screen size

### 3. **Availability Color Scheme**

Colors match Outlook's standard scheduling colors:

| Status | Color | Hex Code | Meaning |
|--------|-------|----------|---------|
| Free | Green | #107c10 | Attendee is available |
| Busy | Red | #e81123 | Attendee is busy |
| Tentative | Yellow | #ffb900 | Attendee is tentative |
| Out of Office | Purple | #7030a0 | Attendee is out of office |
| Working Elsewhere | Blue | #0078d4 | Attendee is working elsewhere |
| Unknown | Gray | #a4a4a4 | Status is unknown |

### 4. **Component Interactions**

#### New Methods
- `toggleSectionVisibility(section: Section)`: Toggle display of attendee's schedule
- Enhanced `refreshView()`: Respects visibility settings

#### Existing Methods Enhanced
- `changePeriod()`: Better handling of time frame changes
- `drop()`: Drag-and-drop functionality (optional, disabled by default)

### 5. **Styling Improvements**

#### Modern Design Features
- **Fluent Design System** inspired styling
- **Smooth transitions** and hover effects
- **Professional color palette** matching Office 365
- **Proper typography** with system font stack
- **Responsive layout** for desktop and mobile
- **Custom scrollbars** for better visual consistency
- **Box shadows** for depth perception
- **Rounded corners** for modern appearance

#### CSS Architecture
- Modular, well-organized stylesheet
- Clear naming conventions
- Mobile-responsive breakpoints
- Accessibility considerations

## Usage Example

### Basic Setup

```typescript
import { Component, OnInit } from '@angular/core';
import moment from 'moment';
import { 
  AvailabilityStatus,
  Events, 
  Item, 
  NgxTimeSchedulerModule, 
  NgxTimeSchedulerService, 
  Period, 
  Section, 
  Text 
} from 'ngx-scheduler';

@Component({
  selector: 'app-scheduling',
  standalone: true,
  imports: [NgxTimeSchedulerModule],
  template: `
    <ngx-ts
      [items]="items"
      [periods]="periods"
      [sections]="sections"
      [events]="events"
      [showHeaderTitle]="true"
      [start]="startScheduler"
      [text]="txt"
    ></ngx-ts>
  `
})
export class SchedulingComponent implements OnInit {
  items: Item[] = [];
  periods: Period[] = [];
  sections: Section[] = [];
  events: Events = new Events();
  txt: Text = new Text();
  startScheduler = moment().startOf('day');

  constructor(private service: NgxTimeSchedulerService) {}

  ngOnInit() {
    // Define periods
    this.periods = [
      {
        name: '3 days',
        timeFramePeriod: 60 * 3,
        timeFrameOverall: 60 * 24 * 3,
        timeFrameHeaders: ['ddd DD MMM', 'HH:mm']
      },
      {
        name: '1 week',
        timeFramePeriod: 60,
        timeFrameOverall: 1440 * 7,
        timeFrameHeaders: ['ddd DD', 'HH:mm']
      }
    ];

    // Define attendees
    this.sections = [
      {
        name: 'Sarah Johnson',
        id: '1',
        email: 'sarah@company.com',
        type: 'attendee',
        isVisible: true
      },
      {
        name: 'Conference Room A',
        id: 'room-1',
        email: 'confroom-a@company.com',
        type: 'room',
        isVisible: true
      }
    ];

    // Define events
    this.items = [
      {
        id: 1,
        name: 'Team Standup',
        sectionID: '1',
        start: moment().hour(9).minute(0),
        end: moment().hour(9).minute(30),
        status: AvailabilityStatus.BUSY,
        organizer: 'Manager',
        attendeeResponse: 'accepted'
      }
    ];

    // Set text labels
    this.txt.SectionTitle = 'Attendees';

    // Handle events
    this.events.ItemClicked = (item: Item) => {
      console.log('Event clicked:', item);
    };
  }
}
```

### Advanced Features

```typescript
// Toggle attendee visibility
toggleAttendee(section: Section) {
  section.isVisible = !section.isVisible;
  // Component automatically updates the view
}

// Add new event
addEvent() {
  const newEvent: Item = {
    id: Date.now(),
    name: 'New Meeting',
    sectionID: '1',
    start: moment().hour(10).minute(0),
    end: moment().hour(11).minute(0),
    status: AvailabilityStatus.BUSY,
    organizer: 'You',
    attendeeResponse: 'organizer'
  };
  this.service.itemPush(newEvent);
}

// Add new attendee
addAttendee() {
  const newAttendee: Section = {
    name: 'New Attendee',
    id: `attendee-${Date.now()}`,
    email: 'newperson@company.com',
    type: 'attendee',
    isVisible: true
  };
  this.service.sectionPush(newAttendee);
}
```

## Component Inputs

```typescript
@Input() currentTimeFormat = 'DD-MMM-YYYY HH:mm';  // Format for current time display
@Input() showCurrentTime = true;                     // Show current time indicator
@Input() showHeaderTitle = true;                     // Show date range header
@Input() showActionButtons = true;                   // Show period/navigation buttons
@Input() showGoto = true;                            // Show "Go to date" button
@Input() showToday = true;                           // Show "Today" button
@Input() allowDragging = false;                      // Enable drag-drop (experimental)
@Input() locale = '';                                // Moment.js locale
@Input() showBusinessDayOnly = false;                // Hide weekends
@Input() headerFormat = 'Do MMM YYYY';               // Header date format
@Input() minRowHeight = 40;                          // Minimum height per attendee
@Input() maxHeight: string = null;                   // Max height of component
@Input() text = new Text();                          // Label texts
@Input() items: Item[];                              // Events to display
@Input() sections: Section[];                        // Attendees/rooms
@Input() periods: Period[];                          // Time period options
@Input() events: Events = new Events();              // Event callbacks
@Input() start = moment().startOf('day');            // Start date/time
```

## Component Outputs

```typescript
@Output() ItemClicked: (item: Item) => void;        // User clicks an event
@Output() ItemContextMenu: (item, event) => void;   // Right-click on event
@Output() SectionClickEvent: (section) => void;     // Click on attendee name
@Output() PeriodChange: (start, end) => void;       // Time period changes
```

## Browser Support

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Considerations

- **Virtual scrolling** for large attendee lists (future enhancement)
- **Efficient change detection** with OnPush strategy (future enhancement)
- **Optimized rendering** of time slots and events
- **Smooth animations** using CSS transitions

## Migration from Previous Version

If upgrading from the original version:

1. **Update Item model** to include `status` and `organizer` fields
2. **Update Section model** to include `email` and `type` fields
3. **Update styling** - all CSS classes have changed:
   - Replace `.time-sch-*` with `.outlook-scheduler-*`
   - Replace `.time-sch-item` with `.calendar-event`
4. **Update templates** - if you had custom styling, review the new CSS structure
5. **Add event handlers** for new features like `toggleSectionVisibility()`

## Accessibility Features

- Keyboard navigation support
- ARIA labels for screen readers
- High contrast colors for readability
- Proper semantic HTML structure
- Focus indicators for keyboard users

## Future Enhancements

- [ ] Virtual scrolling for very large attendee lists
- [ ] Drag-and-drop event creation
- [ ] Event resizing capability
- [ ] Timezone support
- [ ] Recurring event indicators
- [ ] Meeting room resource scheduling
- [ ] Search/filter attendees
- [ ] Calendar integration APIs
- [ ] Export to ICS format
- [ ] Dark mode support

## Troubleshooting

### Events not showing
- Ensure `items` array is populated
- Check `sectionID` matches a section's `id`
- Verify date range includes the event dates

### Attendees not visible
- Ensure `sections` array is populated
- Check `isVisible` property is not false
- Verify section `id` is unique

### Styling issues
- Check that Angular styles are not globally overriding component styles
- Verify ViewEncapsulation is set correctly
- Clear browser cache and rebuild

## License

See LICENSE file in the project root.

## Support

For issues or feature requests, please refer to the project repository.
