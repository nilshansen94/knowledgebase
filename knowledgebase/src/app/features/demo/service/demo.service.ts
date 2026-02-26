import {Injectable} from '@angular/core';
import {BehaviorSubject, combineLatestWith, filter, map, of, Subject} from 'rxjs';
import {DbResult, Folder, KbTreeNode, listToTree, Snippet} from '@kb-rest/shared';
import {delay} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DemoService {

  private readonly userId = 1;

  private readonly updateResult = new Subject<DbResult>();
  updateResult$ = this.updateResult.asObservable();

  currentFolder = new BehaviorSubject<KbTreeNode>(null);
  currentFolder$ = this.currentFolder.asObservable();

  private readonly refreshSnippets$ = new BehaviorSubject<void>(null);
  readonly snippets = new Map<number, Snippet[]>();
  readonly snippets$ = this.currentFolder$.pipe(
    filter(f => !!f),
    combineLatestWith(this.refreshSnippets$),
    map(([folder]) => this.snippets.get(folder.id) || []),
    delay(0),
    //tap(s => console.log('snippet$', s))
  );
  snippetIdCounter = 1;

  communityUser$ = of(1);

  loading$ = of(false);
  hasMore$ = of(false);

  folders: Folder[] = [];
  treeNodes: KbTreeNode[] = [];
  treeNodes$ = new BehaviorSubject<KbTreeNode[]>([]);

  addingFolder$ = new Subject<boolean>();
  folderIdCounter = 1;

  selectedFolderId: number;

  constructor() {}

  addFolder(folder: Folder) {
    this.addingFolder$.next(true);
    folder.id = this.folderIdCounter++;
    this.folders.push(folder);
    this.treeNodes = listToTree(this.folders);
    this.treeNodes$.next(this.treeNodes);
    setTimeout(() => this.addingFolder$.next(false), 0);
    this.setSelectedFolder(folder);
  }

  setSelectedFolder(folder: Folder) {
    if(!folder){
      return;
    }
    // console.log('set selected folder', folder)
    this.selectedFolderId = folder.id;
    this.currentFolder.next({...folder, isFolder: true, childNodes: null});
  }

  addSnippet(snippet: Partial<Snippet>) {
    const snippets = this.snippets.get(this.selectedFolderId) || [];
    const newSnippet: Snippet = {
      id: this.snippetIdCounter++,
      title: snippet.title,
      content: snippet.content,
      user_id: this.userId,
      ufs_user: null,
      user_name: null,
      folder: null,
      is_own_snippet: true,
      is_pinned: false,
      public: snippet.public,
      isActive: true,
    };
    snippets.push(newSnippet);
    this.snippets.set(this.selectedFolderId, snippets);
    this.refreshSnippets$.next();
    this.updateResult.next({success: true});
  }
}
