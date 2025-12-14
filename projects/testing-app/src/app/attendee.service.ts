import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Attendee {
  id: string;
  displayName: string;
  email: string;
  type: 'contact' | 'user' | 'room';
}

/**
 * Service to fetch attendee options from the mock API
 * Provides methods for searching contacts, users, and rooms
 */
@Injectable({
  providedIn: 'root'
})
export class AttendeeService {
  private readonly apiBase = '/api';

  constructor(private http: HttpClient) {}

  /**
   * Fetch contacts from the API
   * @param searchTerm Optional search term to filter results
   */
  getContacts(searchTerm?: string): Observable<Attendee[]> {
    return this.fetchAttendees('/api/contacts', searchTerm);
  }

  /**
   * Fetch users from the API
   * @param searchTerm Optional search term to filter results
   */
  getUsers(searchTerm?: string): Observable<Attendee[]> {
    return this.fetchAttendees('/api/users', searchTerm);
  }

  /**
   * Fetch rooms from the API
   * @param searchTerm Optional search term to filter results
   */
  getRooms(searchTerm?: string): Observable<Attendee[]> {
    return this.fetchAttendees('/api/rooms', searchTerm);
  }

  /**
   * Fetch all types of attendees
   * @param searchTerm Optional search term to filter results
   */
  getAllAttendees(searchTerm?: string): Observable<Attendee[]> {
    return new Observable(subscriber => {
      let results: Attendee[] = [];
      let completed = 0;

      [this.getContacts(searchTerm), this.getUsers(searchTerm), this.getRooms(searchTerm)].forEach(
        observable => {
          observable.subscribe({
            next: attendees => {
              results = [...results, ...attendees];
              completed++;
              if (completed === 3) {
                subscriber.next(results);
                subscriber.complete();
              }
            },
            error: err => subscriber.error(err)
          });
        }
      );
    });
  }

  private fetchAttendees(endpoint: string, searchTerm?: string): Observable<Attendee[]> {
    let url = endpoint;
    if (searchTerm) {
      url += `?q=${encodeURIComponent(searchTerm)}`;
    }
    return this.http.get<{ data: Attendee[] }>(url).pipe(
      map(response => response.data || [])
    );
  }
}
