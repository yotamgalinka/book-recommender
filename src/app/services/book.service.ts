import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private apiUrl = '/api';  // Proxy prefix

  constructor(private http: HttpClient) {}

  searchBooks(query: string, page: number = 1): Observable<any> {
    return this.http.get(`${this.apiUrl}/search.json?q=${query}&page=${page}&limit=10`).pipe(
      timeout(10000), // 10 seconds timeout
      catchError(error => {
        console.error('Request failed with error', error);
        return throwError(error);
      })
    );
  }

  getBookDetails(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/works/${id}.json`).pipe(
      timeout(10000), // 10 seconds timeout
      catchError(error => {
        console.error('Request failed with error', error);
        return throwError(error);
      })
    );
  }

  getBookRatings(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/works/${id}/ratings.json`).pipe(
      timeout(10000), // 10 seconds timeout
      catchError(error => {
        console.error('Request failed with error', error);
        return throwError(error);
      })
    );
  }
}
