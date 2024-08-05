import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BookService } from '../../services/book.service';

@Component({
  selector: 'app-book-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './book-details.component.html',
  styleUrls: ['./book-details.component.css']
})
export class BookDetailsComponent implements OnInit {
  book: any;
  authors: string = '';
  subjects: string = '';
  isLoading: boolean = true;
  error: string | null = null;
  authorQueryParam: string = '';
  yearQueryParam: string = '';
  averageRating: string = '';
  averageRatingQuery: string = '';

  constructor(
    private route: ActivatedRoute,
    private bookService: BookService
  ) {}

  ngOnInit(): void {
    const bookId = this.route.snapshot.paramMap.get('id');
    this.route.queryParams.subscribe(params => {
      this.authorQueryParam = params['author'];
      this.yearQueryParam = params['year'];
      this.averageRatingQuery = params['averageRating'];
    });

    if (bookId) {
      this.bookService.getBookDetails(bookId).subscribe(
        (data: any) => {
          console.log('Book details:', data);  // Log the data
          this.book = data;

          // Check and assign authors
          if (Array.isArray(this.book.authors) && this.book.authors.length > 0) {
            this.authors = this.book.authors.map((a: { name: string }) => a.name).join(', ');
          } else {
            this.authors = 'N/A';
          }

          // Check and assign genres
          if (Array.isArray(this.book.subjects) && this.book.subjects.length > 0) {
            this.subjects = this.book.subjects.map((s: { name: string }) => s.name).join(', ');
          } else {
            this.subjects = 'N/A';
          }

          // Safely assign the ratings_average value to averageRating
          // If ratings_average is not available, averageRating = null
          this.averageRating = this.book.ratings_average ?? null;

          this.isLoading = false;
        },
        (error: any) => {
          this.error = 'Error fetching book details';
          this.isLoading = false;
        }
      );
    }
  }
}
