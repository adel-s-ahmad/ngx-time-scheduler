# Async Attendee Loading Feature

## Overview

This document describes the async attendee loading feature for the NGX Scheduler component. This feature allows you to load attendee data asynchronously from an API, with built-in support for searching and filtering by name or email.

## Architecture

### Components

1. **MockHttpInterceptor** (`mock-http.interceptor.ts`)
   - HTTP interceptor that intercepts requests to `/api/*` endpoints
   - Provides mock test data without requiring a real backend
   - Supports filtering by search term
   - Simulates network latency with 300ms delay

2. **AttendeeService** (`attendee.service.ts`)
   - Service that fetches attendee data from the API
   - Provides methods to fetch contacts, users, rooms, or all attendees
   - Supports optional search filtering

3. **TestAsyncAttendeesComponent** (`test-async-attendees.component.ts`)
   - Standalone component demonstrating the async attendee feature
   - Includes UI for testing the service
   - Shows usage examples and mock data information

### Data Flow

```
Component (NgxScheduler)
    ↓
asyncAttendeeLoader callback
    ↓
AttendeeService method
    ↓
HttpClient.get()
    ↓
MockHttpInterceptor (intercepts /api/* requests)
    ↓
Returns mock data (with filtering and delay)
    ↓
AttendeeService maps response
    ↓
Component receives Attendee[]
```

## Usage

### Step 1: Inject AttendeeService

```typescript
import { AttendeeService, Attendee } from './attendee.service';

@Component({
  // ...
})
export class MyComponent {
  constructor(private attendeeService: AttendeeService) {}
}
```

### Step 2: Create Attendee Loader Function

```typescript
attendeeLoader = (searchTerm: string): Promise<Attendee[]> => {
  return this.attendeeService.getAllAttendees(searchTerm)
    .toPromise() as Promise<Attendee[]>;
};
```

The `asyncAttendeeLoader` callback receives a search term and must return a Promise that resolves to an array of Attendee objects.

### Step 3: Pass to NgxScheduler Component

```html
<ngx-scheduler
  [asyncAttendeeLoader]="attendeeLoader"
  [events]="events"
  (eventCreated)="onEventCreated($event)"
  (eventUpdated)="onEventUpdated($event)"
  (eventDeleted)="onEventDeleted($event)">
</ngx-scheduler>
```

## Attendee Interface

```typescript
interface Attendee {
  id: string;
  displayName: string;
  email: string;
  type: 'contact' | 'user' | 'room';
}
```

- **id**: Unique identifier
- **displayName**: Name to display in the UI
- **email**: Email address for notification purposes
- **type**: Category of attendee (contact, user, or room)

## Mock API Endpoints

The MockHttpInterceptor provides the following endpoints:

### `/api/contacts`
External contacts and clients. Sample data includes:
- Alice Johnson (alice@example.com)
- Bob Smith (bob@example.com)
- Charlie Brown (charlie@example.com)
- Diana Prince (diana@example.com)
- Evan Davis (evan@example.com)
- Fiona Green (fiona@example.com)
- George Wilson (george@example.com)

### `/api/users`
Internal team members and employees. Sample data includes:
- Admin User (admin@example.com)
- John Developer (john.dev@example.com)
- Sarah Designer (sarah@example.com)
- Mike Manager (mike@example.com)
- Lisa Analyst (lisa@example.com)
- Tom Tester (tom@example.com)
- Emma Engineer (emma@example.com)
- David Developer (david@example.com)

### `/api/rooms`
Meeting rooms and resources. Sample data includes:
- Conference Room A (conf-a@example.com)
- Conference Room B (conf-b@example.com)
- Meeting Room 101 (meet-101@example.com)
- Meeting Room 102 (meet-102@example.com)
- Board Room (board@example.com)
- Training Room (training@example.com)
- Zoom Room West (zoom-west@example.com)

## Search Functionality

All endpoints support filtering by search term using the `q` query parameter:

```typescript
// Fetch contacts that match "admin"
this.attendeeService.getContacts('admin').subscribe(
  contacts => console.log(contacts)
);

// URL: /api/contacts?q=admin
```

The search is case-insensitive and filters by both `displayName` and `email` fields.

## Network Latency Simulation

The MockHttpInterceptor adds a 300ms delay to simulate network latency:

```typescript
return of(new HttpResponse({
  status: 200,
  body: { data: filteredItems }
})).pipe(delay(300));
```

This helps test the component's loading state and error handling.

## Integration with Real API

To use a real backend instead of the mock data:

### Option 1: Disable Mock Interceptor
Remove or conditionally disable the MockHttpInterceptor in `app.config.ts`:

```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    // Remove or comment out:
    // { provide: HTTP_INTERCEPTORS, useClass: MockHttpInterceptor, multi: true }
  ]
};
```

### Option 2: Update Service Endpoints
Modify `attendee.service.ts` to point to your real API:

```typescript
export class AttendeeService {
  private readonly apiBase = 'https://api.example.com'; // Change this

  getContacts(searchTerm?: string): Observable<Attendee[]> {
    return this.fetchAttendees(`${this.apiBase}/contacts`, searchTerm);
  }
  
  // ... rest of implementation
}
```

### Option 3: Implement Backend Endpoints
Your API should implement these endpoints:

```
GET /api/contacts?q=search_term
GET /api/users?q=search_term
GET /api/rooms?q=search_term
```

Response format:
```json
{
  "data": [
    {
      "id": "c1",
      "displayName": "Alice Johnson",
      "email": "alice@example.com",
      "type": "contact"
    }
  ]
}
```

## Testing

### Run the Test Component

Navigate to the test app and include the component in your routing:

```typescript
import { TestAsyncAttendeesComponent } from './test-async-attendees.component';

export const routes: Routes = [
  {
    path: 'test-async-attendees',
    component: TestAsyncAttendeesComponent
  }
];
```

Then visit `http://localhost:4200/test-async-attendees`

### Test Methods

The test component provides buttons to test:
- **Load Contacts** - Fetch all contacts
- **Load Users** - Fetch all users
- **Load Rooms** - Fetch all rooms
- **Load All** - Fetch all attendee types
- **Search "admin"** - Search for "admin" across all types
- **Clear Results** - Clear the results table

## Error Handling

The AttendeeService and test component include error handling:

```typescript
getAllAttendees(searchTerm?: string): Observable<Attendee[]> {
  return new Observable(subscriber => {
    // ... implementation
    observable.subscribe({
      next: attendees => { /* handle success */ },
      error: err => subscriber.error(err) // propagate error
    });
  });
}
```

Errors are displayed in the test component and can be handled in your component:

```typescript
this.attendeeService.getAllAttendees(searchTerm).subscribe({
  next: (attendees) => {
    // Handle successful response
  },
  error: (error) => {
    // Handle error
    console.error('Failed to load attendees:', error);
  }
});
```

## Performance Considerations

1. **Debouncing**: Consider debouncing search requests to avoid too many API calls
2. **Caching**: Implement caching in the service if the attendee list doesn't change frequently
3. **Pagination**: For large result sets, implement pagination in the backend
4. **Lazy Loading**: Load attendees only when the attendee combobox is opened

## Example: Full Integration

```typescript
import { Component, OnInit } from '@angular/core';
import { NgxTimeSchedulerModule, Events, Section, Period } from 'ngx-scheduler';
import { AttendeeService, Attendee } from './attendee.service';

@Component({
  selector: 'app-scheduler',
  imports: [NgxTimeSchedulerModule],
  template: `
    <ngx-scheduler
      [events]="events"
      [asyncAttendeeLoader]="attendeeLoader">
    </ngx-scheduler>
  `
})
export class SchedulerComponent {
  events: Events = new Events();

  // Define async loader
  attendeeLoader = (searchTerm: string): Promise<Attendee[]> => {
    return this.attendeeService
      .getAllAttendees(searchTerm)
      .toPromise() as Promise<Attendee[]>;
  };

  constructor(private attendeeService: AttendeeService) {
    this.initializeEvents();
  }

  initializeEvents(): void {
    // Initialize your events here
  }
}
```

## Files Included

- `mock-http.interceptor.ts` - HTTP interceptor for mock data
- `attendee.service.ts` - Service for fetching attendee data
- `test-async-attendees.component.ts` - Test component with UI
- `app.config.ts` - Updated to provide HTTP client and interceptor
- `ASYNC_ATTENDEE_README.md` - This documentation file

## Next Steps

1. Import `TestAsyncAttendeesComponent` in your routing to see the feature in action
2. Integrate `AttendeeService` with the `NgxSchedulerComponent`
3. Update endpoints and response format to match your actual API
4. Implement additional features like pagination, advanced search, etc.

## Support

For issues or questions, refer to the test component at `/test-async-attendees`.
