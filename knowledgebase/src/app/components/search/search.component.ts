import {Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {debounceTime, distinctUntilChanged, fromEvent, Subscription, tap} from 'rxjs';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit, OnDestroy {

  currentSearch: string;

  @ViewChild('searchInput', {static: true}) searchInput: ElementRef;
  inputSubscription: Subscription;

  @Output() search = new EventEmitter<string>();

  ngOnInit() {
    this.inputSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
      debounceTime(500),
      distinctUntilChanged(),
      tap((e: KeyboardEvent) => {
        if(e.key === 'Escape'){
          this.currentSearch = '';
          this.search.emit('');
          return;
        }
        this.search.emit(this.currentSearch);
      })
    ).subscribe();
  }

  ngOnDestroy() {
    this.inputSubscription.unsubscribe();
  }

  clear() {
    if(!this.currentSearch) {
      return;
    }
    this.currentSearch = '';
    this.search.emit('');
  }
}
