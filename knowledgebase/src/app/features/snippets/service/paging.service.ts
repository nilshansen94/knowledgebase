import {Injectable} from '@angular/core';
import {PAGE_SIZE} from '@kb-rest/shared';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PagingService {

  constructor() { }

  private readonly currentPage = new BehaviorSubject<number>(0);
  private readonly loading = new BehaviorSubject<boolean>(false);
  private readonly hasMore = new BehaviorSubject<boolean>(true);
  private nextPage = 0;

  loading$ = this.loading.asObservable();
  hasMore$ = this.hasMore.asObservable();
  currentPage$ = this.currentPage.asObservable();

  loadMore() {
    if (this.loading.value || !this.hasMore.value) {
      console.log('not loading more items');
      return false;
    }
    this.currentPage.next(this.nextPage);
    return true;
  }

  updatePagingState(itemCount: number) {
    if (itemCount < PAGE_SIZE) {
      this.hasMore.next(false);
    } else {
      this.hasMore.next(true);
    }
    if (itemCount > 0) {
      this.nextPage = this.currentPage.value + 1;
    }
  }

  resetPaging() {
    this.currentPage.next(0);
    this.hasMore.next(true);
    this.loading.next(false);
  }

  setLoading(loading: boolean) {
    this.loading.next(loading);
  }

  setHasMore(hasMore: boolean) {
    this.hasMore.next(hasMore);
  }

  getCurrentPage(): number {
    return this.currentPage.value;
  }
}
