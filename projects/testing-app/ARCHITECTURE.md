# Async Attendee Feature - Architecture & Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       Your Application                           │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │
                    ┌─────────┴──────────┐
                    │                    │
                    │                    ▼
        ┌───────────────────┐  ┌──────────────────────┐
        │  NgxScheduler     │  │  Your Component      │
        │  Component        │  │  (Uses service)      │
        └────────┬──────────┘  └──────────┬───────────┘
                 │                        │
                 └────────────┬───────────┘
                              │
                              ▼
                 ┌──────────────────────────┐
                 │  attendeeLoader          │
                 │  callback function       │
                 └────────────┬─────────────┘
                              │
                              ▼
                 ┌──────────────────────────┐
                 │  AttendeeService         │
                 │  ├─ getContacts()        │
                 │  ├─ getUsers()           │
                 │  ├─ getRooms()           │
                 │  └─ getAllAttendees()    │
                 └────────────┬─────────────┘
                              │
                              ▼
                 ┌──────────────────────────┐
                 │  HttpClient.get()        │
                 │  (Returns Observable)    │
                 └────────────┬─────────────┘
                              │
                              ▼
                 ┌──────────────────────────┐
                 │  HTTP Interceptor        │
                 │  Intercepts /api/* calls │
                 └────────────┬─────────────┘
                              │
                  ┌───────────┬───────────┐
                  │           │           │
                  ▼           ▼           ▼
            ┌─────────┐  ┌────────┐  ┌───────┐
            │Contacts │  │ Users  │  │ Rooms │
            │  (7)    │  │  (8)   │  │  (7)  │
            └─────────┘  └────────┘  └───────┘
                  │           │           │
                  └───────────┬───────────┘
                              │
                              ▼
                 ┌──────────────────────────┐
                 │  Response with 300ms     │
                 │  network latency delay   │
                 └────────────┬─────────────┘
                              │
                              ▼
                 ┌──────────────────────────┐
                 │  Attendee[]              │
                 │  Mapped to component     │
                 └──────────────────────────┘
```

## Data Flow Diagram

```
Start Component Load
        │
        ▼
┌─────────────────────────────┐
│ Component.attendeeLoader    │
│ = (searchTerm) => Promise   │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ NgxScheduler detects async  │
│ attendee input              │
└──────────────┬──────────────┘
               │
        ┌──────┴──────┐
        │ User opens  │
        │ attendee    │
        │ dropdown    │
        └──────┬──────┘
               │
               ▼
┌─────────────────────────────┐
│ attendeeLoader(searchTerm)  │
│ called with search string   │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ AttendeeService.            │
│ getAllAttendees(searchTerm) │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ HttpClient calls:           │
│ /api/contacts?q=search      │
│ /api/users?q=search         │
│ /api/rooms?q=search         │
└──────────────┬──────────────┘
               │
               ▼ (All 3 requests parallel)
┌─────────────────────────────┐
│ MockHttpInterceptor:        │
│ 1. Receives request         │
│ 2. Filters mock data        │
│ 3. Waits 300ms (simulate)   │
│ 4. Returns filtered result  │
└──────────────┬──────────────┘
               │
               ▼ (All responses combine)
┌─────────────────────────────┐
│ Service maps responses      │
│ to Attendee[] format        │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ Promise resolves with       │
│ combined Attendee[] result  │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ NgxScheduler populates      │
│ attendee dropdown with      │
│ search results              │
└──────────────┬──────────────┘
               │
               ▼
End: User selects attendee
```

## Component Interaction Diagram

```
┌─────────────────────────────────────────────────────────┐
│            Your Component                               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  constructor(                                           │
│    private attendeeService: AttendeeService             │
│  ) { }                                                  │
│                                                         │
│  attendeeLoader = (searchTerm: string): Promise => {    │
│    return this.attendeeService.getAllAttendees(...)     │
│      .toPromise() as Promise<Attendee[]>;               │
│  };                                                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
                          │
                          │ passes to
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│            NgxScheduler Component                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  <ngx-scheduler                                         │
│    [asyncAttendeeLoader]="attendeeLoader"               │
│    [events]="events"                                    │
│    ...other properties...                               │
│  ></ngx-scheduler>                                      │
│                                                         │
│  When user clicks to add attendee:                      │
│  1. Shows search input                                  │
│  2. Calls attendeeLoader(searchTerm)                    │
│  3. Displays loading state                              │
│  4. Shows results when Promise resolves                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Service Architecture

```
┌──────────────────────────────────────────────────────────┐
│                  AttendeeService                         │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Private Properties:                                     │
│  ├─ apiBase = '/api'                                     │
│                                                          │
│  Public Methods:                                         │
│  ├─ getContacts(searchTerm?)                             │
│  │   └─ calls fetchAttendees('/api/contacts', ...)       │
│  │                                                       │
│  ├─ getUsers(searchTerm?)                                │
│  │   └─ calls fetchAttendees('/api/users', ...)          │
│  │                                                       │
│  ├─ getRooms(searchTerm?)                                │
│  │   └─ calls fetchAttendees('/api/rooms', ...)          │
│  │                                                       │
│  └─ getAllAttendees(searchTerm?)                          │
│      └─ combines results from get* methods               │
│                                                          │
│  Private Methods:                                        │
│  └─ fetchAttendees(endpoint, searchTerm)                 │
│     ├─ HttpClient.get(endpoint?q=...)                    │
│     └─ maps { data: [] } to Attendee[]                   │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## HTTP Interceptor Flow

```
┌──────────────────────────────────────────────────────────┐
│              MockHttpInterceptor                         │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  intercept(req, next):                                   │
│  │                                                       │
│  ├─ Check if /api/* endpoint?                            │
│  │  │                                                    │
│  │  └─ Yes:                                              │
│  │     ├─ Extract searchTerm from query params            │
│  │     ├─ Get mock data for endpoint                      │
│  │     ├─ Filter by searchTerm (case-insensitive)        │
│  │     ├─ Add 300ms delay with delay()                   │
│  │     └─ Return HttpResponse with filtered data          │
│  │                                                       │
│  └─ No:                                                  │
│     └─ Pass through: next.handle(req)                    │
│                                                          │
│  Mock Data Stored:                                       │
│  ├─ /api/contacts → [7 contact objects]                  │
│  ├─ /api/users → [8 user objects]                        │
│  └─ /api/rooms → [7 room objects]                        │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## Response Format

```
Request:
  GET /api/users?q=admin

Processing:
  1. Extract q='admin'
  2. Load all users: [u1, u2, ..., u8]
  3. Filter: users matching 'admin' in name or email
  4. Wait 300ms
  5. Create response

Response:
  {
    "data": [
      {
        "id": "u1",
        "displayName": "Admin User",
        "email": "admin@example.com",
        "type": "user"
      }
    ]
  }

Service Processing:
  1. Receive response with { data: [...] }
  2. Map to response.data || []
  3. Return Attendee[]

Component Receives:
  Promise<Attendee[]>
    ├─ { id: "u1", displayName: "Admin User", ... }
    └─ ... (other matches)
```

## State Management

```
Component Loading States:

Initial State:
  events: NgxSchedulerEvent[] = []
  
Adding Event:
  1. Create new event with empty attendees
  2. Open event editor
  
Adding Attendees:
  1. User types in attendee search
  2. Component calls attendeeLoader(searchTerm)
  3. Service makes HTTP request
  4. Interceptor filters mock data
  5. Promise resolves with results
  6. Dropdown shows filtered results
  7. User selects attendee
  8. Event updated with attendee
  
Saving Event:
  event.attendees = [
    { id: 'u1', displayName: 'Admin User', type: 'user' },
    { id: 'r1', displayName: 'Conference Room A', type: 'room' }
  ]
```

## Search Filtering Logic

```
Input:
  Endpoint: /api/users
  Search Term: "admin"
  All Users: [u1, u2, ..., u8]

Filtering Process:
  for each user in allUsers:
    check if user.displayName.toLowerCase() includes 'admin'
    OR user.email.toLowerCase() includes 'admin'
    
    if matches:
      add to results

Output:
  Filtered Results: [
    {
      id: 'u1',
      displayName: 'Admin User',
      email: 'admin@example.com',
      type: 'user'
    }
  ]
```

## Error Handling Flow

```
Try to Load Attendees:
         │
         ▼
Service.getAllAttendees()
         │
    ┌────┴────┐
    │          │
    ▼          ▼
  Success    Error
    │          │
    │          ▼
    │    Error Event
    │    (bubbles up)
    │          │
    └────┬─────┘
         │
         ▼
  Component.loadData()
    subscribe({
      next: (data) => display results,
      error: (err) => show error message
    })
```

## Testing Component Interaction

```
┌─────────────────────────────────────┐
│  TestAsyncAttendeesComponent        │
├─────────────────────────────────────┤
│                                     │
│  ┌──────────────────────────────┐  │
│  │  Button: Load Contacts       │  │
│  └────────────┬─────────────────┘  │
│               │                     │
│               ▼                     │
│  loadData(() =>                    │
│    attendeeService.getContacts()   │
│  )                                 │
│               │                     │
│               ▼                     │
│  results: Attendee[] = [...]       │
│               │                     │
│               ▼                     │
│  Display in Results Table           │
│                                     │
│  Columns:                           │
│  ├─ ID                              │
│  ├─ Name                            │
│  ├─ Email                           │
│  └─ Type Badge                      │
│                                     │
└─────────────────────────────────────┘
```

## File Dependency Diagram

```
app.config.ts
    │
    ├─ imports MockHttpInterceptor
    └─ registers in HTTP_INTERCEPTORS
    
Your Component
    │
    ├─ injects AttendeeService
    └─ implements attendeeLoader()
    
NgxScheduler
    │
    └─ uses [asyncAttendeeLoader]
    
AttendeeService
    │
    ├─ depends on HttpClient
    └─ calls fetchAttendees()
    
MockHttpInterceptor
    │
    ├─ intercepts HttpClient requests
    ├─ filters mock data
    └─ returns HttpResponse
    
TestAsyncAttendeesComponent
    │
    ├─ injects AttendeeService
    ├─ tests all service methods
    └─ displays results
```

## Timeline Diagram

```
User Action Timeline:

T=0ms:   User clicks "Load All" button
         │
T=0ms:   Button click handler invokes loadData()
         │
T=0ms:   Service calls .subscribe()
         │
T=0ms:   Service calls getAllAttendees()
         │
T=0ms:   makeRequest(
           Observable.from([
             getContacts(),
             getUsers(),
             getRooms()
           ])
         )
         │
T=0ms:   HttpClient.get() issued
         │         │         │
T=0ms:   /api/contacts, /api/users, /api/rooms
         │         │         │
T=0ms:   Interceptor intercepts all 3
         │         │         │
T=300ms: Delay completes
         │         │         │
T=300ms: Filter data, create response
         │         │         │
T=300ms: Return HttpResponse
         │
T=300ms: Service receives responses
         │
T=300ms: Map and combine results
         │
T=300ms: next(combinedResults)
         │
T=300ms: Component receives results
         │
T=300ms: results = [22 attendees]
         │
T=300ms: Display in table
         │
End:     User sees all attendees
```

---

## Summary

The async attendee feature provides a complete system for loading attendee data:

1. **Component** defines how to load attendees
2. **Service** manages API calls and data transformation
3. **Interceptor** handles mock data or proxies to real API
4. **Scheduler** uses the loaded attendees for event management

All components work together to provide a seamless experience for managing event attendees with async data loading from an API.
