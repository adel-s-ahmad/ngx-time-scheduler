# Async Attendee Feature - Quick Reference

## File Structure

```
testing-app/src/app/
├── attendee.service.ts              # Main service
├── mock-http.interceptor.ts         # Mock API provider
├── test-async-attendees.component.ts # Test/demo component
├── app.config.ts                    # Configuration (updated)
└── ASYNC_ATTENDEE_README.md         # Full documentation
```

## Service API

### AttendeeService

```typescript
// Inject the service
constructor(private attendeeService: AttendeeService) {}

// Fetch methods (all return Observable<Attendee[]>)
getContacts(searchTerm?: string): Observable<Attendee[]>
getUsers(searchTerm?: string): Observable<Attendee[]>
getRooms(searchTerm?: string): Observable<Attendee[]>
getAllAttendees(searchTerm?: string): Observable<Attendee[]>
```

### Attendee Interface

```typescript
interface Attendee {
  id: string;                              // Unique ID
  displayName: string;                    // Display name
  email: string;                          // Email address
  type: 'contact' | 'user' | 'room';     // Attendee type
}
```

## Usage Pattern

### 1. Basic Integration

```typescript
import { AttendeeService } from './attendee.service';

@Component({...})
export class MyComponent {
  attendeeLoader = (searchTerm: string): Promise<Attendee[]> => {
    return this.attendeeService.getAllAttendees(searchTerm)
      .toPromise() as Promise<Attendee[]>;
  };

  constructor(private attendeeService: AttendeeService) {}
}
```

### 2. Template Usage

```html
<ngx-scheduler
  [asyncAttendeeLoader]="attendeeLoader"
  [events]="events">
</ngx-scheduler>
```

### 3. Manual API Calls

```typescript
// Get all contacts
this.attendeeService.getContacts().subscribe(
  contacts => console.log(contacts)
);

// Search for specific user
this.attendeeService.getUsers('john').subscribe(
  users => console.log(users)
);

// Get all attendees (combined results)
this.attendeeService.getAllAttendees('admin').subscribe(
  allAttendees => console.log(allAttendees)
);
```

## Mock API Endpoints

- `GET /api/contacts` - Contacts list
- `GET /api/users` - Users list
- `GET /api/rooms` - Rooms list
- `GET /api/contacts?q=search` - Search contacts
- `GET /api/users?q=search` - Search users
- `GET /api/rooms?q=search` - Search rooms

## Testing

### Run Test Component

1. Add route:
```typescript
{
  path: 'test-async-attendees',
  component: TestAsyncAttendeesComponent
}
```

2. Visit: `http://localhost:4200/test-async-attendees`

3. Test with buttons:
   - Load Contacts
   - Load Users
   - Load Rooms
   - Load All
   - Search "admin"

### Browser DevTools

1. Open Network tab
2. Click "Load All"
3. Observe requests to `/api/contacts`, `/api/users`, `/api/rooms`
4. Note 300ms delay

## Common Tasks

### Task: Use custom backend
```typescript
// In attendee.service.ts
private readonly apiBase = 'https://your-api.com';
```

### Task: Add search debouncing
```typescript
import { debounceTime } from 'rxjs/operators';

searchTerm$ = new Subject<string>();

constructor(private attendeeService: AttendeeService) {
  this.searchTerm$.pipe(
    debounceTime(300)
  ).subscribe(term => this.searchAttendees(term));
}
```

### Task: Cache results
```typescript
private cache = new Map<string, Attendee[]>();

getAllAttendees(searchTerm: string = ''): Observable<Attendee[]> {
  const cacheKey = searchTerm || 'all';
  
  if (this.cache.has(cacheKey)) {
    return of(this.cache.get(cacheKey)!);
  }
  
  return this.attendeeService.getAllAttendees(searchTerm).pipe(
    tap(data => this.cache.set(cacheKey, data))
  );
}
```

### Task: Handle errors
```typescript
this.attendeeService.getAllAttendees(searchTerm).subscribe({
  next: (attendees) => {
    console.log('Loaded', attendees.length, 'attendees');
  },
  error: (error) => {
    console.error('Failed to load attendees:', error);
    this.showErrorMessage('Unable to load attendees');
  },
  complete: () => {
    console.log('Attendee loading complete');
  }
});
```

## Mock Data Available

### Contacts (7)
- Alice Johnson
- Bob Smith
- Charlie Brown
- Diana Prince
- Evan Davis
- Fiona Green
- George Wilson

### Users (8)
- Admin User
- John Developer
- Sarah Designer
- Mike Manager
- Lisa Analyst
- Tom Tester
- Emma Engineer
- David Developer

### Rooms (7)
- Conference Room A
- Conference Room B
- Meeting Room 101
- Meeting Room 102
- Board Room
- Training Room
- Zoom Room West

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Service not found | Import from `./attendee.service` |
| No data returned | Check `/api/*` endpoints in network tab |
| Interceptor not working | Verify `MockHttpInterceptor` in `app.config.ts` |
| Component not standalone | Add `standalone: true` to decorator |
| Search returns nothing | Check search term matches name or email |
| High latency | Remove `delay(300)` from `mock-http.interceptor.ts` |

## Dependencies

- `@angular/common` - CommonModule, HttpClientModule
- `@angular/core` - Injectable, Interceptor
- `rxjs` - Observable, of, delay, map operators

## Performance Notes

- Default 300ms network latency simulation
- Search filters in-memory (supports ~100+ items)
- For large datasets (1000+), implement server-side pagination
- Consider debouncing search input (recommended: 300ms)
- Implement caching for frequently accessed data

## Links

- [Full Documentation](./src/app/ASYNC_ATTENDEE_README.md)
- [Feature Overview](./ASYNC_ATTENDEE_FEATURE.md)
- [Test Component](./src/app/test-async-attendees.component.ts)

## Version

- Angular 14+
- RxJS 7+
- TypeScript 4.7+
