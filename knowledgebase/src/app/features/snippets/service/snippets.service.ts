import {Injectable} from '@angular/core';
import {BehaviorSubject, catchError, combineLatest, map, Observable, of, shareReplay, Subject, switchMap, take, tap} from 'rxjs';
import {MyHttpService} from '../../../services/http/my-http.service';
import {DbResult, Snippet, SnippetPinRequest} from '@kb-rest/shared';
import {AppService} from '../../../services/app/app.service';
import {ActivatedRoute} from '@angular/router';
import {PagingService} from './paging.service';

@Injectable({
  providedIn: 'root'
})
export class SnippetsService {

  constructor(
    private readonly httpService: MyHttpService,
    private readonly appService: AppService,
    private readonly route: ActivatedRoute,
    private readonly pagingService: PagingService,
  ) { }

  private readonly searchQuery = new BehaviorSubject<string>('');

  private readonly selectedSnippet = new BehaviorSubject<number | null>(null);
  public readonly selectedSnippet$ = this.selectedSnippet.asObservable();
  private selectedSnippetTimeout: any;
  private refreshSnippets = new BehaviorSubject<void>(null);

  private readonly snippetsStore = new Map<number, Snippet[]>();

  private readonly selectedFolder$ = this.appService.selectedFolder$.pipe(
    map(folder => folder ? '/' + folder : ''),
    tap(() => {
      this.resetPaging();
    })
  );

  snippets$: Observable<Snippet[]> = combineLatest([
    this.refreshSnippets,
    this.selectedFolder$,
    this.searchQuery,
    this.appService.selectedUserId$,
    this.pagingService.currentPage$,
  ]).pipe(
     map(([_,folder, query, user, page]) => [folder, this.mapUrlParams(query, user, page)]),
     switchMap(([folder, params]) => {
       if (!folder && !params) {
         this.snippetsStore.clear();
         this.pagingService.setLoading(false);
         this.pagingService.setHasMore(false);
         return of(null);
       }
       this.pagingService.setLoading(true);
       //console.log('get snippets' + folder + params);
       return this.httpService.get('snippets' + folder + params);
     }),
     catchError(e => {
       console.error('Cannot get snippets', e);
       //todo this blocks everything
       this.pagingService.setLoading(false);
       this.pagingService.resetPaging();
       return of([]);
     }),
     shareReplay(),
     //todo more db interfaces
     map(folders => folders as (Snippet & { folder: number })[]),
     //convert tiny-int from mysql to boolean
     tap(snippets => {
       this.pagingService.setLoading(false);
       this.pagingService.updatePagingState(snippets?.length || 0);
       if (this.pagingService.getCurrentPage() === 0) {
         this.snippetsStore.clear();
       }
     }),
     map(snippets => {
       const mappedSnippets = snippets?.map(s => ({
       ...s,
       public: s.public === 1 || s.public === true,
       is_pinned: s.is_pinned === 1 || s.is_pinned === true,
     }));
       if (mappedSnippets) {
         this.snippetsStore.set(this.pagingService.getCurrentPage(), mappedSnippets);
       }

       // Get all snippets from the store, ordered by page
       return Array.from(this.snippetsStore.entries())
       .sort(([pageA], [pageB]) => pageA - pageB)
       .flatMap(([_, snippets]) => snippets);
     }),
   );

  private readonly updateResult = new Subject<DbResult>();
  /** The result of an update or delete operation */
  updateResult$ = this.updateResult.asObservable();

  addSnippet(snippet: Partial<Snippet>) {
    const folder = +this.route.snapshot.queryParamMap.get('folder');
    if(!folder){
      alert('Please select a folder');
      return;
    }
    this.httpService.put('snippet', {title: snippet.title, content: snippet.content, public: snippet.public, folder}).pipe(
      tap(res => {
        this.appService.refreshSelectedFolder();
        this.updateResult.next(res as DbResult);
      }),
      take(1),
    ).subscribe();
  }

  editSnippet$(snippet: Snippet) {
    return this.httpService.post('snippet', snippet).pipe(
      tap((edited: DbResult) => {
        if(edited) {
          this.updateStore(edited.data);
        }
        this.updateResult.next(edited);
      }),
      take(1),
    );
  }

  updateStore(updatedSnippet: Snippet) {
    for(const [page, snippets] of this.snippetsStore.entries()) {
      let i = 0;
      for(const snippet of snippets) {
        if(snippet.id === updatedSnippet.id) {
          const copy = {...snippet};
          copy.title = updatedSnippet.title;
          copy.content = updatedSnippet.content;
          copy.public = updatedSnippet.public;
          snippets[i] = copy;
          this.snippetsStore.set(page, [...snippets]);
          this.refreshSnippets.next();
          return;
        }
        i++;
      }
    }
  }

  deleteSnippet(snippet: any) {
    this.httpService.delete('snippet', snippet.id).pipe(
      tap(() => {
        this.appService.refreshSelectedFolder();
      }),
      take(1),
    ).subscribe();
  }

  searchSnippet(searchQuery: string) {
    this.resetPaging();
    this.searchQuery.next(searchQuery);
  }

  private mapUrlParams(search: string, user: number, page: number) {
    if(!search && user === null && page === 0) {
      return '';
    }
    const params: any = {};
    if (search) {
      params.search = search;
    }
    if (!isNaN(user)) {
      params.user = user;
    }
    if (page > 0) {
      params.page = page;
    }
    return '?' + new URLSearchParams(params).toString();
  }

  loadMore() {
    if (this.snippetsStore.size === 0) {
      return;
    }
    this.pagingService.loadMore();
  }

  resetPaging() {
    this.pagingService.resetPaging();
    this.snippetsStore.clear();
  }

  togglePublicSnippet$(snippet: Snippet) {
    return this.httpService.post('snippet-public', snippet).pipe(
      tap((res: DbResult) => {
        this.updateStore(res.data);
        this.updateResult.next(res);
      }),
      take(1),
    );
  }

  setSelectedSnippet(id: number | null) {
    this.selectedSnippet.next(id);
    clearTimeout(this.selectedSnippetTimeout);
    this.selectedSnippetTimeout = setTimeout(() => {
      this.selectedSnippet.next(null);
    }, 1500);
  }

  pinCommunitySnippet(request: SnippetPinRequest) {
    this.httpService.post('snippet-pin', request).pipe(
      tap(() => this.appService.refreshSelectedFolder()),
      take(1)
    ).subscribe(r => console.log('pin community snippet request and result', request, r));
  }
}
