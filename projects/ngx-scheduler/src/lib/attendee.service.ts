import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';
import { Attendee } from './ngx-scheduler.model';

/**
 * Service for loading attendees from remote APIs.
 * Handles API calls with caching, error handling, and timeout management.
 */
@Injectable({
  providedIn: 'root'
})
export class AttendeeService {
  private readonly DEFAULT_TIMEOUT_MS = 10000; // 10 seconds
  private readonly REQUEST_CACHE = new Map<string, { data: Attendee[]; timestamp: number }>();
  private readonly CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

  constructor(private http: HttpClient) {}

  /**
   * Fetch attendees from a remote API endpoint
   * 
   * @param apiUrl - The API endpoint URL
   * @param searchTerm - Optional search term to filter results
   * @param queryParamName - Query parameter name for search (default: 'q')
   * @param responseDataPath - Path to attendees array in response (e.g., 'data.items')
   * @param timeoutMs - Request timeout in milliseconds (default: 10000)
   * @param useCache - Whether to use cached results (default: true)
   * 
   * @returns Observable of Attendee array
   * 
   * @example
   * this.attendeeService.fetchAttendees(
   *   'https://api.example.com/contacts',
   *   'john',
   *   'q',
   *   'data'
   * ).subscribe(attendees => console.log(attendees));
   */
  fetchAttendees(
    apiUrl: string,
    searchTerm: string = '',
    queryParamName: string = 'q',
    responseDataPath: string = '',
    timeoutMs: number = this.DEFAULT_TIMEOUT_MS,
    useCache: boolean = true
  ): Observable<Attendee[]> {
    if (!apiUrl || !apiUrl.trim()) {
      return of([]);
    }

    // Build cache key
    const cacheKey = `${apiUrl}|${searchTerm}`;

    // Check cache first
    if (useCache && this.isValidCacheEntry(cacheKey)) {
      const cached = this.REQUEST_CACHE.get(cacheKey);
      if (cached) {
        return of(cached.data);
      }
    }

    // Build request with optional search parameter
    let params = new HttpParams();
    if (searchTerm && searchTerm.trim()) {
      params = params.set(queryParamName, searchTerm.trim());
    }

    return this.http.get<any>(apiUrl, { params }).pipe(
      timeout(timeoutMs),
      map(response => {
        // Extract attendees from response based on path
        let attendees = this.extractAttendees(response, responseDataPath);

        // Ensure array structure
        if (!Array.isArray(attendees)) {
          attendees = [];
        }

        // Cache the result
        if (useCache) {
          this.REQUEST_CACHE.set(cacheKey, {
            data: attendees,
            timestamp: Date.now()
          });
        }

        return attendees;
      }),
      catchError(error => {
        console.error(`Failed to fetch attendees from ${apiUrl}:`, error);
        return of([]);
      })
    );
  }

  /**
   * Clear cache for a specific URL or entire cache
   */
  clearCache(apiUrl?: string): void {
    if (apiUrl) {
      // Clear specific URL from cache
      const keysToDelete = Array.from(this.REQUEST_CACHE.keys()).filter(key =>
        key.startsWith(apiUrl)
      );
      keysToDelete.forEach(key => this.REQUEST_CACHE.delete(key));
    } else {
      // Clear entire cache
      this.REQUEST_CACHE.clear();
    }
  }

  /**
   * Check if cache entry is still valid
   */
  private isValidCacheEntry(cacheKey: string): boolean {
    const cached = this.REQUEST_CACHE.get(cacheKey);
    if (!cached) return false;

    const age = Date.now() - cached.timestamp;
    return age < this.CACHE_DURATION_MS;
  }

  /**
   * Extract attendees from response object using path notation
   * 
   * @example
   * response = { data: { items: [...] } }
   * path = 'data.items'
   * returns the items array
   */
  private extractAttendees(response: any, path: string): Attendee[] {
    if (!path || !path.trim()) {
      // If no path specified, assume response is the array
      return response && Array.isArray(response) ? response : [];
    }

    // Navigate through path (e.g., 'data.items' → response.data.items)
    let result = response;
    const pathParts = path.split('.');

    for (const part of pathParts) {
      if (result && typeof result === 'object' && part in result) {
        result = result[part];
      } else {
        return [];
      }
    }

    return Array.isArray(result) ? result : [];
  }
}
