import {Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';

import {debounceTime, distinctUntilChanged, fromEvent, Subscription, tap} from 'rxjs';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit, OnDestroy {

  currentSearch: string;

  @ViewChild('searchInput', {static: true}) searchInput: ElementRef;
  inputSubscription: Subscription;

  @Output() searchChange = new EventEmitter<string>();

  ngOnInit() {
    this.inputSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
      debounceTime(500),
      distinctUntilChanged(),
      tap((e: KeyboardEvent) => {
        if(e.key === 'Escape'){
          this.currentSearch = '';
          this.searchChange.emit('');
          return;
        }
        this.searchChange.emit(this.currentSearch);
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
    this.searchChange.emit('');
  }
}
