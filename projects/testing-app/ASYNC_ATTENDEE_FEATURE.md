# Async Attendee Feature Implementation

## Summary

This implementation adds comprehensive support for asynchronously loading attendees from an API in the NGX Scheduler component. The feature includes:

- **Mock HTTP Interceptor** for testing without a real backend
- **Attendee Service** for fetching contacts, users, and rooms
- **Test Component** with UI for validating the feature
- **Comprehensive Documentation**

## Quick Start

### 1. View the Test Component

Add to your routing:

```typescript
import { TestAsyncAttendeesComponent } from './app/test-async-attendees.component';

export const routes: Routes = [
  {
    path: 'test-async-attendees',
    component: TestAsyncAttendeesComponent
  }
];
```

Visit `http://localhost:4200/test-async-attendees`

### 2. Use in Your Component

```typescript
import { AttendeeService, Attendee } from './app/attendee.service';

export class MySchedulerComponent {
  attendeeLoader = (searchTerm: string): Promise<Attendee[]> => {
    return this.attendeeService.getAllAttendees(searchTerm)
      .toPromise() as Promise<Attendee[]>;
  };

  constructor(private attendeeService: AttendeeService) {}
}
```

### 3. Pass to NgxScheduler

```html
<ngx-scheduler
  [asyncAttendeeLoader]="attendeeLoader"
  [events]="events">
</ngx-scheduler>
```

## Files Created

### Service Layer
- **`src/app/attendee.service.ts`**
  - Main service for attendee data fetching
  - Methods: `getContacts()`, `getUsers()`, `getRooms()`, `getAllAttendees()`
  - All methods support optional search term parameter
  - Returns Observable<Attendee[]>

### HTTP Interceptor
- **`src/app/mock-http.interceptor.ts`**
  - Intercepts HTTP requests to `/api/*` endpoints
  - Provides mock data without a real backend
  - Implements search filtering
  - Adds 300ms delay to simulate network latency
  - Configured in `app.config.ts`

### Test Component
- **`src/app/test-async-attendees.component.ts`**
  - Standalone component demonstrating the feature
  - Interactive buttons to test different scenarios
  - Results displayed in a formatted table
  - Shows usage examples and API documentation

### Configuration
- **`src/app/app.config.ts`**
  - Updated to provide `HttpClient`
  - Registers `MockHttpInterceptor` in HTTP_INTERCEPTORS

### Documentation
- **`src/app/ASYNC_ATTENDEE_README.md`**
  - Comprehensive documentation of the feature
  - Architecture diagrams
  - Integration examples
  - Backend integration instructions

## Mock Data

The interceptor provides test data for:

- **Contacts**: 7 external contacts
- **Users**: 8 internal team members
- **Rooms**: 7 meeting rooms

All data includes name, email, ID, and type.

## Search Functionality

Search across all attendee types:

```typescript
this.attendeeService.getAllAttendees('admin').subscribe(
  attendees => console.log(attendees)
);
```

Search is case-insensitive and matches both name and email fields.

## Integration with Real API

To use your own API instead of mock data:

1. **Update Service Endpoints**
   ```typescript
   private readonly apiBase = 'https://your-api.com';
   ```

2. **Ensure Response Format**
   ```json
   {
     "data": [
       {
         "id": "...",
         "displayName": "...",
         "email": "...",
         "type": "contact|user|room"
       }
     ]
   }
   ```

3. **Disable Mock Interceptor** (optional)
   Remove from `app.config.ts` providers

## Component Integration Example

```typescript
import { Component } from '@angular/core';
import { NgxTimeSchedulerModule } from 'ngx-scheduler';
import { AttendeeService } from './attendee.service';

@Component({
  selector: 'app-scheduler',
  imports: [NgxTimeSchedulerModule],
  template: `
    <ngx-scheduler
      [asyncAttendeeLoader]="attendeeLoader"
      [events]="events">
    </ngx-scheduler>
  `
})
export class SchedulerComponent {
  events: any[] = [];

  attendeeLoader = (searchTerm: string): Promise<any[]> => {
    return this.attendeeService.getAllAttendees(searchTerm)
      .toPromise() as Promise<any[]>;
  };

  constructor(private attendeeService: AttendeeService) {}
}
```

## Testing Checklist

- [ ] Run test component at `/test-async-attendees`
- [ ] Click "Load Contacts" button - should show 7 contacts
- [ ] Click "Load Users" button - should show 8 users
- [ ] Click "Load Rooms" button - should show 7 rooms
- [ ] Click "Load All" button - should show all 22 items
- [ ] Click "Search 'admin'" button - should filter results
- [ ] Verify 300ms delay in network tab
- [ ] Test in your scheduler component with attendee loading

## Performance Tips

1. **Debounce Search Requests**
   ```typescript
   import { debounceTime } from 'rxjs/operators';
   
   searchAttendees$ = new Subject<string>();
   
   constructor() {
     this.searchAttendees$.pipe(
       debounceTime(300)
     ).subscribe(term => this.loadAttendees(term));
   }
   ```

2. **Cache Results**
   - Implement a simple cache in AttendeeService
   - Avoid repeated requests for same search term

3. **Implement Pagination**
   - Add limit and offset parameters for large datasets
   - Load more results on scroll

## Architecture Overview

```
┌─────────────────────────────────────┐
│  NgxSchedulerComponent              │
│  [asyncAttendeeLoader]="loader"     │
└────────────────┬────────────────────┘
                 │
                 ↓
        ┌─────────────────────┐
        │ AttendeeService     │
        │ - getContacts()     │
        │ - getUsers()        │
        │ - getRooms()        │
        │ - getAllAttendees() │
        └────────┬────────────┘
                 │
                 ↓
        ┌──────────────────────┐
        │ HttpClient.get()     │
        └────────┬─────────────┘
                 │
                 ↓
        ┌──────────────────────────┐
        │ MockHttpInterceptor      │
        │ /api/contacts            │
        │ /api/users               │
        │ /api/rooms               │
        │ (with search & delay)    │
        └──────────────────────────┘
```

## Troubleshooting

**Q: The module 'ngx-scheduler' not found**
A: Ensure the library is installed and properly configured in your project

**Q: Search not working**
A: Check that the search term is being passed to the service method

**Q: No data appearing**
A: Verify the mock interceptor is registered in `app.config.ts`

**Q: High latency in requests**
A: The 300ms delay is intentional for testing. Remove it by modifying `mock-http.interceptor.ts`

## Next Steps

1. ✅ Test the feature with the provided test component
2. ✅ Integrate into your scheduler component
3. ⏳ Replace mock data with real API integration
4. ⏳ Add caching and debouncing for performance
5. ⏳ Implement pagination for large datasets
6. ⏳ Add custom search filters and sorting

For detailed documentation, see `ASYNC_ATTENDEE_README.md`.
