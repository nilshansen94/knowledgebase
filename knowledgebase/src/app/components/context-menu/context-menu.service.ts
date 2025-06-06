import {Injectable} from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';
import {ContextMenuItem} from './context-menu.component';

export interface ContextMenuState {
  show: boolean;
  x: number;
  y: number;
  items: ContextMenuItem[];
}

const initialState: ContextMenuState = {
  show: false,
  x: 0,
  y: 0,
  items: []
};

@Injectable({
  providedIn: 'root'
})
export class ContextMenuService {
  private state = new BehaviorSubject<ContextMenuState>(initialState);
  state$ = this.state.asObservable();

  private itemClicked = new Subject<ContextMenuItem>();
  itemClicked$ = this.itemClicked.asObservable();

  private closed = new Subject<void>();
  closed$ = this.closed.asObservable();

  show(x: number, y: number, items: ContextMenuItem[]) {
    this.state.next({ show: true, x, y, items });
  }

  close() {
    this.state.next(initialState);
    this.closed.next();
  }

  onItemClick(item: ContextMenuItem) {
    this.itemClicked.next(item);
    this.close();
  }
}
