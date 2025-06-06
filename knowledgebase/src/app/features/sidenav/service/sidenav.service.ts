import {Injectable} from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  filter,
  firstValueFrom,
  map,
  Observable,
  of,
  shareReplay,
  switchMap,
  take,
  tap,
  withLatestFrom
} from 'rxjs';
import {Folder} from '../api/folder';
import {MyHttpService} from '../../../services/http/my-http.service';
import {AppService} from '../../../services/app/app.service';
import {SnippetsService} from '../../snippets/service/snippets.service';
import {KbTreeNode} from '../api/kb-tree-node';
import {Snippet} from '../../snippets/api/snippet';
import {SnippetPinRequest} from '@kb-rest/shared';
import {ActivatedRoute} from '@angular/router';
import {ModalService} from '../../../services/modal/modal.service';
import {AuthService} from '../../../services/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class SidenavService {


  private showSidenav = new BehaviorSubject<boolean>(false);
  public showSidenav$ = this.showSidenav.asObservable();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly httpService: MyHttpService,
    private readonly appService: AppService,
    private readonly snippetsService: SnippetsService,
    private readonly modalService: ModalService,
    private readonly authService: AuthService,
  ) {}

  toggleSidenav() {
    this.showSidenav.next(!this.showSidenav.getValue());
  }

  private foldersRefresh = new BehaviorSubject<void>(undefined);

  private addingFolderInProgress = new BehaviorSubject<boolean>(false);
  public addingFolderInProgress$ = this.addingFolderInProgress.asObservable();

  folders$: Observable<KbTreeNode[]> = combineLatest([
    this.foldersRefresh,
    this.appService.selectedUserId$,
    //this.authService.isLoggedIn$,
  ]).pipe(
    //filter(([_, loggedIn]: [void, boolean]) => loggedIn === true),
    switchMap(() => this.snippetsService.snippets$.pipe(
      withLatestFrom(this.appService.selectedUserId$),
      switchMap(([snippets, user]) => this.httpService.get('folders' + this.mapUrlParams(user)).pipe(
        map(folders => folders as KbTreeNode[]),
        catchError(error => {
          console.error('Error loading folders:', error);
          return of([]);
        })
      ))
    )),
    tap(folders => {
      this.addingFolderInProgress.next(false);
      //console.log('folders$ emitting:', folders);
    }),
    shareReplay(),
    /*map(([snippets, folders]: [Snippet[], Folder[]]) => {
      const snippetsByFolder = new Map<number, Snippet[]>();
      if(snippets){
        for(const snippet of snippets){
          if(!snippetsByFolder.has(snippet.folder)){
            snippetsByFolder.set(snippet.folder, []);
          }
          snippetsByFolder.get(snippet.folder).push(snippet);
        }
        //this.addSnippetsToFolders(folders as KbTreeNode[], snippetsByFolder);
      }
      return folders as KbTreeNode[];
    })*/
  );

  currentFolder$: Observable<KbTreeNode> = combineLatest([
    this.appService.selectedFolder$.pipe(
      filter(selectedFolder => !isNaN(selectedFolder)),
    ),
    this.folders$.pipe(
      filter(folders => !!folders),
      //flatten
      map(folders => folders.reduce((acc, folder) => [...acc, folder, ...(folder.childNodes || [])], []))
    )
  ]).pipe(
    map(([currentFolder, folders]) => folders.find(f => f.id === +currentFolder)),
  );

  public selectedUserName$ = this.appService.selectedUserId$.pipe(
    switchMap(id => {
      if(id === null || id < 0) {
        return of(null);
      }
      return this.httpService.get('username/' + id);
    }),
    catchError(error => {
      console.error('Error loading folders:', error);
      return of(null);
    }),
    map((res: {name: string}) => res?.name),
  );

  addSnippetsToFolders(folders: KbTreeNode[], snippetMap: Map<number, Snippet[]>) {
    for (const folder of folders) {
      if (!folder.childNodes) {
        folder.childNodes = [];
      }
      if (folder.childNodes.length > 0) {
        this.addSnippetsToFolders(folder.childNodes, snippetMap);
      }
      const snippets = snippetMap.get(folder.id) || [];
      folder.childNodes = folder.childNodes.concat(snippets.map(snippet => ({name: snippet.title, id: snippet.id}) as KbTreeNode));
    }
  }

  addFolder(folder: Folder) {
    this.addingFolderInProgress.next(true);
    return this.httpService.put('addFolder', folder).pipe(
      tap(res => {
        console.log('addFolder', res);
        this.foldersRefresh.next();
        // this.appService.refreshSelectedFolder();
      }),
      catchError(err => {
        this.addingFolderInProgress.next(false);
        throw err;
      }),
    );
  }

  renameFolder(folder: Folder) {
    return this.httpService.post('renameFolder', folder).pipe(
      tap(() => this.appService.refreshSelectedFolder())
    );
  }

  moveFolders(map: Map<number, number>) {
    const data = Array.from(map.entries()).map(([k, v]) => [k, v]);
    console.log(data);
    this.httpService.post('moveFolders', data).pipe(
      tap(res => {
        this.appService.refreshSelectedFolder();
      })
    ).subscribe();
  }

  moveSnippets(map: Map<number, number>) {
    const data = Array.from(map.entries()).map(([k, v]) => [k, v]);
    this.httpService.post('moveSnippets', data).pipe(
      tap(res => {
        this.appService.refreshSelectedFolder();
      })
    ).subscribe();
  }

  deleteFolder(folderId: number) {
    return this.httpService.delete('folder', folderId).pipe(
      tap((response: any) => {
        if (response.success) {
          this.appService.refreshSelectedFolder();
        }
      })
    );
  }

  private mapUrlParams(user: number) {
    if (!user) {
      return '';
    }
    return '?' + new URLSearchParams({user: user + ''}).toString();
  }

  /**
   * pin or unpin a snippet
   * This method is in the sidenavService instead of the snippetService because of cyclic dependencies
   */
  async pinSnippet(snippet: Snippet) {
    const user = this.route.snapshot.queryParamMap.get('user');
    let folderId = this.appService.getSelectedFolder();
    if (user) {
      const folders = await firstValueFrom(this.folders$);
      const selectedFolder = await this.modalService.openSelectFolderModal({folders});
      if (!selectedFolder) {
        return;
      }
      folderId = selectedFolder.id;
    }
    const request: SnippetPinRequest = {
      snippetId: snippet.id,
      folder: folderId,
      remove: Boolean(snippet.isPinned)
    };
    this.httpService.post('snippet-pin', request).pipe(
      tap(() => this.appService.refreshSelectedFolder()),
      take(1)
    ).subscribe(r => console.log('snippet-pin request and result', request, r));
  }

}
