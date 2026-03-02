import {Injectable} from '@angular/core';
import {BehaviorSubject, combineLatestWith, map, of, Subject} from 'rxjs';
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

  searchQuery = new BehaviorSubject<string>(null);

  private readonly refreshSnippets$ = new BehaviorSubject<void>(null);
  readonly snippets = new Map<number, Snippet[]>([
    [1, [
      this.generateSnippet(1,
        'Welcome to Knowledge Base',
        `Getting Started with Markdown\n\nThis is a **demo snippet** to show you how to use markdown formatting.\n\n### Features\n\n- Create snippets with *rich text* formatting\n- Organize them in folders\n- Share with others or keep them private\n\n`,
        true),
      this.generateSnippet(2, 'Chores', `### 🏠 To-Do\n- [ ] Clean kitchen\n- [ ] Vacuum rooms\n- [ ] Do laundry`, false)
    ]],
    [2, [this.generateSnippet(3,
      'Demo note',
      `Code Example:\n\nYou can also include code blocks:\n\n\`\`\`javascript\nfunction greet(name) {\n  console.log('Hello, ' + name + '!');\n}\n\`\`\`\n\n> **Tip:** Use markdown to make your snippets more readable!`,
      false)]]
  ]);
  readonly snippets$ = this.currentFolder$.pipe(
    combineLatestWith(this.refreshSnippets$),
    map(([folder]) => {
      if (!folder) {
        return [];
      }
      const snippets = this.snippets.get(folder.id) || [];
      if (this.searchQuery.value && !this.snippets.get(this.selectedFolderId).find(s => s.id === 99)) {
        return [...snippets, this.generateSnippet(99, 'Community note', 'This is a demo note from a community user that appears, when you search for content.', true, false)];
      }
      return snippets;
    }),
    delay(0),
    //tap(s => console.log('snippet$', s))
  );
  snippetIdCounter = 4;

  communityUser$ = of(1);

  loading$ = of(false);
  hasMore$ = of(false);

  folders: Folder[] = [];
  treeNodes: KbTreeNode[] = [];
  treeNodes$ = new BehaviorSubject<KbTreeNode[]>(
    listToTree([
      {id: 1, name: 'home'},
      {id: 2, name: 'work'},
    ])
  );

  addingFolder$ = new Subject<boolean>();
  folderIdCounter = 3;

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
      this.selectedFolderId = null;
      this.currentFolder.next(null);
      return;
    }
    // console.log('set selected folder', folder)
    this.selectedFolderId = folder.id;
    this.currentFolder.next({...folder, isFolder: true, childNodes: null});
  }

  addSnippet(snippet: Partial<Snippet>) {
    const snippets = this.snippets.get(this.selectedFolderId) || [];
    const newSnippet = this.generateSnippet(this.snippetIdCounter++, snippet.title, snippet.content, snippet.public);
    snippets.push(newSnippet);
    this.snippets.set(this.selectedFolderId, snippets);
    this.refreshSnippets$.next();
    this.updateResult.next({success: true});
  }

  generateSnippet(
    id: number,
    title: string,
    content: string,
    isPublic: boolean | number,
    isOwn = true,
  ): Snippet {
    return {
      id,
      title,
      content,
      user_id: this.userId,
      ufs_user: null,
      user_name: isOwn ? null : 'nils',
      folder: null,
      is_own_snippet: isOwn,
      is_pinned: false,
      public: isPublic,
      isActive: true,
    }
  }

  search(text: string) {
    this.searchQuery.next(text);
    this.refreshSnippets$.next();
  }

  pinSnippet(snippet: Snippet) {
    if (snippet.is_pinned) {
      //unpin
      this.snippets.set(
        this.selectedFolderId,
        this.snippets.get(this.selectedFolderId)
        .filter(s => s.id !== snippet.id));
      this.refreshSnippets$.next();
      this.updateResult.next({success: true});
      return;
    }
    if (!this.snippets.get(this.selectedFolderId)) {
      this.snippets.set(this.selectedFolderId, []);
    }
    this.snippets.get(this.selectedFolderId).push({...snippet, is_pinned: true});
    this.refreshSnippets$.next();
    this.updateResult.next({success: true});
  }
}
