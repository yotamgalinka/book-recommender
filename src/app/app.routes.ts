import { Routes } from '@angular/router';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { BookDetailsComponent } from './components/book-details/book-details.component';

export const routes: Routes = [
  { path: '', component: SearchBarComponent },
  { path: 'book/:id', component: BookDetailsComponent },
];
