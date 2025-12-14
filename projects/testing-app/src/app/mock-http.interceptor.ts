import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

/**
 * Mock HTTP Interceptor for testing async attendee loading
 * Simulates API responses without needing a real backend
 */
@Injectable()
export class MockHttpInterceptor implements HttpInterceptor {
  private mockData = {
    '/api/contacts': [
      { id: 'mc1', displayName: 'Alice Johnson', email: 'alice@example.com', type: 'contacts' },
      { id: 'mc2', displayName: 'Bob Smith', email: 'bob@example.com', type: 'contacts' },
      { id: 'mc3', displayName: 'Charlie Brown', email: 'charlie@example.com', type: 'contacts' },
      { id: 'mc4', displayName: 'Diana Prince', email: 'diana@example.com', type: 'contacts' },
      { id: 'mc5', displayName: 'Evan Davis', email: 'evan@example.com', type: 'contacts' },
      { id: 'mc6', displayName: 'Fiona Green', email: 'fiona@example.com', type: 'contacts' },
      { id: 'mc7', displayName: 'George Wilson', email: 'george@example.com', type: 'contacts' }
    ],
    '/api/users': [
      { id: 'mu1', displayName: 'Admin User', email: 'admin@example.com', type: 'users' },
      { id: 'mu2', displayName: 'John Developer', email: 'john.dev@example.com', type: 'users' },
      { id: 'mu3', displayName: 'Sarah Designer', email: 'sarah@example.com', type: 'users' },
      { id: 'mu4', displayName: 'Mike Manager', email: 'mike@example.com', type: 'users' },
      { id: 'mu5', displayName: 'Lisa Analyst', email: 'lisa@example.com', type: 'users' },
      { id: 'mu6', displayName: 'Tom Tester', email: 'tom@example.com', type: 'users' },
      { id: 'mu7', displayName: 'Emma Engineer', email: 'emma@example.com', type: 'users' },
      { id: 'mu8', displayName: 'David Developer', email: 'david@example.com', type: 'users' }
    ],
    '/api/rooms': [
      { id: 'mr1', displayName: 'Conference Room A', email: 'conf-a@example.com', type: 'rooms' },
      { id: 'mr2', displayName: 'Conference Room B', email: 'conf-b@example.com', type: 'rooms' },
      { id: 'mr3', displayName: 'Meeting Room 101', email: 'meet-101@example.com', type: 'rooms' },
      { id: 'mr4', displayName: 'Meeting Room 102', email: 'meet-102@example.com', type: 'rooms' },
      { id: 'mr5', displayName: 'Board Room', email: 'board@example.com', type: 'rooms' },
      { id: 'mr6', displayName: 'Training Room', email: 'training@example.com', type: 'rooms' },
      { id: 'mr7', displayName: 'Zoom Room West', email: 'zoom-west@example.com', type: 'rooms' }
    ]
  };

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Check if this is a mock API URL
    const mockUrl = this.getMockUrlPath(req.url);

    console.log('[MockHttpInterceptor] Request URL:', req.url);
    console.log('[MockHttpInterceptor] Mock URL path:', mockUrl);
    console.log('[MockHttpInterceptor] Available endpoints:', Object.keys(this.mockData));
    console.log('[MockHttpInterceptor] Is mock endpoint:', mockUrl in this.mockData);

    if (mockUrl in this.mockData) {
      console.log('[MockHttpInterceptor] Handling mock request for:', mockUrl);

      // Get search term from query params
      const searchTerm = req.params.get('q')?.toLowerCase() ?? '';
      console.log('[MockHttpInterceptor] Search term:', searchTerm);

      // Get all items for this endpoint
      const allItems = (this.mockData as any)[mockUrl];
      console.log('[MockHttpInterceptor] All items:', allItems);

      // Filter by search term (name or email)
      let filteredItems = allItems;
      if (searchTerm) {
        filteredItems = allItems.filter((item: any) =>
          item.displayName.toLowerCase().includes(searchTerm) ||
          (item.email || '').toLowerCase().includes(searchTerm)
        );
      }

      console.log('[MockHttpInterceptor] Filtered items:', filteredItems);

      // Return mock response with 300ms delay to simulate network latency
      // Use of() with delay and proper event wrapping
      return of(
        new HttpResponse<{ data: any[] }>({
          status: 200,
          statusText: 'OK',
          body: { data: filteredItems },
          headers: req.headers,
          url: req.url
        }) as HttpEvent<any>
      ).pipe(delay(300));
    }

    console.log('[MockHttpInterceptor] Passing through to next handler');
    // Pass through to real HTTP handler if not a mock URL
    return next.handle(req);
  }

  private getMockUrlPath(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname;
    } catch {
      return url;
    }
  }
}
