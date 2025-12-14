import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AttendeeService, Attendee } from './attendee.service';

/**
 * Test component demonstrating async attendee loading
 * Shows how to use the async attendee feature with mock API data
 *
 * NOTE: This component requires NgxSchedulerComponent to be imported.
 * Once ngx-scheduler library is installed, uncomment the import below:
 *
 * import { NgxTimeSchedulerModule } from 'ngx-scheduler';
 *
 * And add to imports array:
 * imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxTimeSchedulerModule]
 */
@Component({
  selector: 'app-test-async-attendees',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="container">
      <h1>NGX Scheduler - Async Attendees Demo</h1>

      <div class="demo-section">
        <h2>Async Attendee Loader Service</h2>

        <div class="info-panel">
          <h3>Overview</h3>
          <p>
            This component demonstrates the <strong>AttendeeService</strong> that provides
            async loading of attendees from a mock API. The service supports:
          </p>
          <ul>
            <li><strong>Contacts</strong> - External contacts and clients</li>
            <li><strong>Users</strong> - Internal team members</li>
            <li><strong>Rooms</strong> - Meeting rooms and resources</li>
            <li><strong>Search</strong> - Filter by name or email</li>
          </ul>
        </div>

        <div class="controls">
          <h3>Test Attendee Service</h3>
          <div class="button-group">
            <button (click)="testGetContacts()">Load Contacts</button>
            <button (click)="testGetUsers()">Load Users</button>
            <button (click)="testGetRooms()">Load Rooms</button>
            <button (click)="testGetAll()">Load All</button>
            <button (click)="testSearch('admin')">Search "admin"</button>
            <button (click)="clearResults()">Clear Results</button>
          </div>
        </div>

        <div class="results-panel" *ngIf="results.length > 0">
          <h3>Results ({{ results.length }} items)</h3>
          <table class="results-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let attendee of results">
                <td>{{ attendee.id }}</td>
                <td>{{ attendee.displayName }}</td>
                <td>{{ attendee.email }}</td>
                <td><span class="type-badge" [class]="'type-' + attendee.type">{{ attendee.type }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="debug-panel" *ngIf="lastError">
          <h3>Error</h3>
          <p class="error-message">{{ lastError }}</p>
        </div>

        <div class="usage-panel">
          <h3>Usage in NgxSchedulerComponent</h3>
          <pre><code [innerText]="usageExample"></code></pre>
        </div>

        <div class="mock-data-panel">
          <h3>Mock API Data</h3>
          <p>The mock HTTP interceptor provides test data at these endpoints:</p>
          <ul>
            <li><code>/api/contacts</code> - 7 test contacts</li>
            <li><code>/api/users</code> - 8 test users</li>
            <li><code>/api/rooms</code> - 7 test rooms</li>
          </ul>
          <p>
            The interceptor automatically filters by search term and adds a 300ms delay
            to simulate network latency.
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    h1 {
      color: #333;
      margin-bottom: 30px;
      font-size: 28px;
    }

    h2 {
      color: #555;
      margin-top: 0;
      margin-bottom: 15px;
      font-size: 20px;
    }

    h3 {
      color: #666;
      margin-top: 0;
      font-size: 16px;
    }

    .demo-section {
      background: #f9f9f9;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .info-panel,
    .controls,
    .results-panel,
    .usage-panel,
    .mock-data-panel,
    .debug-panel {
      margin-bottom: 20px;
      background: white;
      padding: 15px;
      border-radius: 6px;
      border-left: 4px solid #007bff;
    }

    .controls {
      border-left-color: #28a745;
    }

    .results-panel {
      border-left-color: #17a2b8;
    }

    .usage-panel {
      border-left-color: #ffc107;
    }

    .mock-data-panel {
      border-left-color: #6f42c1;
    }

    .debug-panel {
      border-left-color: #dc3545;
    }

    .info-panel p {
      margin: 10px 0;
      color: #555;
      line-height: 1.6;
    }

    .info-panel ul {
      margin: 10px 0;
      padding-left: 20px;
    }

    .info-panel li {
      margin: 5px 0;
      color: #555;
    }

    .button-group {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 10px;
    }

    button {
      padding: 8px 16px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background-color 0.2s;
    }

    button:hover {
      background-color: #0056b3;
    }

    button:active {
      background-color: #004085;
    }

    .results-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      font-size: 13px;
    }

    .results-table th {
      background-color: #f0f0f0;
      padding: 10px;
      text-align: left;
      font-weight: 600;
      border-bottom: 2px solid #ddd;
    }

    .results-table td {
      padding: 8px 10px;
      border-bottom: 1px solid #eee;
    }

    .results-table tr:hover {
      background-color: #f5f5f5;
    }

    .type-badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 3px;
      font-size: 12px;
      font-weight: 600;
      color: white;
    }

    .type-contact {
      background-color: #6f42c1;
    }

    .type-user {
      background-color: #28a745;
    }

    .type-room {
      background-color: #17a2b8;
    }

    pre {
      background-color: #f5f5f5;
      padding: 15px;
      border-radius: 4px;
      overflow-x: auto;
      font-size: 12px;
      line-height: 1.4;
      margin: 10px 0;
    }

    code {
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      color: #333;
    }

    .error-message {
      color: #dc3545;
      padding: 10px;
      background-color: #f8d7da;
      border: 1px solid #f5c6cb;
      border-radius: 4px;
    }

    .mock-data-panel code {
      background-color: #f0f0f0;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 13px;
    }
  `]
})
export class TestAsyncAttendeesComponent implements OnInit {
  results: Attendee[] = [];
  lastError = '';
  isLoading = false;

  usageExample = `// In your component:
import { AttendeeService } from './attendee.service';

export class MyComponent {
  attendeeLoader = (searchTerm: string): Promise<Attendee[]> => {
    return this.attendeeService.getAllAttendees(searchTerm)
      .toPromise() as Promise<Attendee[]>;
  };

  constructor(private attendeeService: AttendeeService) {}
}

// In your template:
<ngx-scheduler
  [asyncAttendeeLoader]="attendeeLoader"
  ...other properties...
></ngx-scheduler>`;

  constructor(private attendeeService: AttendeeService) {}

  ngOnInit(): void {
    // Component initialized
  }

  testGetContacts(): void {
    this.loadData(() => this.attendeeService.getContacts());
  }

  testGetUsers(): void {
    this.loadData(() => this.attendeeService.getUsers());
  }

  testGetRooms(): void {
    this.loadData(() => this.attendeeService.getRooms());
  }

  testGetAll(): void {
    this.loadData(() => this.attendeeService.getAllAttendees());
  }

  testSearch(term: string): void {
    this.loadData(() => this.attendeeService.getAllAttendees(term));
  }

  clearResults(): void {
    this.results = [];
    this.lastError = '';
  }

  private loadData(apiCall: () => any): void {
    this.isLoading = true;
    this.lastError = '';

    apiCall().subscribe({
      next: (data: Attendee[]) => {
        this.results = data;
        this.isLoading = false;
      },
      error: (error: any) => {
        this.lastError = `Error loading data: ${error.message}`;
        this.isLoading = false;
      }
    });
  }
}
