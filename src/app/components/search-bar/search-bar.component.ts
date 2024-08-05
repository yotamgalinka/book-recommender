import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { BookService } from '../../services/book.service';
import { of } from 'rxjs';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css']
})
export class SearchBarComponent implements OnInit {
  searchControl = new FormControl('');
  searchResults: any[] = [];
  query: string = '';
  currentPage: number = 1;
  isLoadingMore: boolean = false;
  isLastPage: boolean = false;
  error: string | null = null;
  noBooks: boolean = false;

  constructor(private bookService: BookService, private router: Router) {}

  ngOnInit(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        this.query = query || ''; // make sure query is always a string
        this.currentPage = 1;
        this.searchResults = [];
        this.isLastPage = false;
        this.error = null;
        this.noBooks = false;
        this.isLoadingMore = true; // use isLoadingMore for initial loading
        console.log('Initial search started, isLoadingMore:', this.isLoadingMore);
        return query ? this.bookService.searchBooks(this.query).pipe(
          catchError(err => {
            this.error = 'Error in request. Please try again.';
            this.isLoadingMore = false;
            console.log('Initial search error, isLoadingMore:', this.isLoadingMore);
            return of({ docs: [] });
          })
        ) : of({ docs: [] });
      })
    ).subscribe((response: any) => {
      if (response.docs.length === 0) {
        this.noBooks = true;
      } else {
        this.searchResults = response.docs.slice(0, 10);
        this.noBooks = false;
      }
      this.isLoadingMore = false; // reset loading state
      console.log('Initial search completed, isLoadingMore:', this.isLoadingMore);
    });
  }

  searchBooks(): void {
    if (this.query) {
      this.currentPage = 1;
      this.searchResults = [];
      this.isLastPage = false;
      this.error = null;
      this.noBooks = false;
      this.isLoadingMore = true;
      console.log('Search started, isLoadingMore:', this.isLoadingMore);
      this.bookService.searchBooks(this.query, this.currentPage).pipe(
        catchError(err => {
          this.error = 'Error in request. Please try again.';
          this.isLoadingMore = false;
          console.log('Search error, isLoadingMore:', this.isLoadingMore);
          return of({ docs: [] });
        })
      ).subscribe((response: any) => {
        if (response.docs.length === 0 && this.currentPage === 1) {
          this.noBooks = true;
        } else if (response.docs.length > 0) {
          this.searchResults = response.docs;
          this.noBooks = false;
        }
        this.isLoadingMore = false;
        console.log('Search completed, isLoadingMore:', this.isLoadingMore);
        if (response.docs.length < 10) {
          this.isLastPage = true;
        }
      });
    }
  }

  loadMoreBooks(): void {
    if (!this.isLoadingMore) {
      this.currentPage++;
      this.isLoadingMore = true;
      console.log('Load more started, isLoadingMore:', this.isLoadingMore);
      this.bookService.searchBooks(this.query, this.currentPage).pipe(
        catchError(err => {
          this.error = 'Error in request. Please try again.';
          this.isLoadingMore = false;
          console.log('Load more error, isLoadingMore:', this.isLoadingMore);
          return of({ docs: [] });
        })
      ).subscribe((response: any) => {
        if (response.docs.length > 0) {
          this.searchResults = [...this.searchResults, ...response.docs];
        }
        this.isLoadingMore = false;
        console.log('Load more completed, isLoadingMore:', this.isLoadingMore);
        if (response.docs.length < 10) {
          this.isLastPage = true;
        }
      });
    }
  }

  tryAgain(): void {
    this.error = null;
    this.isLoadingMore = true;
    console.log('Retry started, isLoadingMore:', this.isLoadingMore);
    this.bookService.searchBooks(this.query, this.currentPage).pipe(
      catchError(err => {
        this.error = 'Error in request. Please try again.';
        this.isLoadingMore = false;
        console.log('Retry error, isLoadingMore:', this.isLoadingMore);
        return of({ docs: [] });
      })
    ).subscribe((response: any) => {
      if (response.docs.length > 0) {
        this.searchResults = [...this.searchResults, ...response.docs];
        this.noBooks = false;
      }
      this.isLoadingMore = false;
      console.log('Retry completed, isLoadingMore:', this.isLoadingMore);
      if (response.docs.length < 10) {
        this.isLastPage = true;
      }
    });
  }

  selectBook(bookId: string, author: string, year: string, rating: number): void {
    this.router.navigate(['/book', bookId], { queryParams: { author, year ,averageRating: rating } });
  }
}
