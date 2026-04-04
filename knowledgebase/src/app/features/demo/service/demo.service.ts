import {inject, Injectable} from '@angular/core';
import {BehaviorSubject, combineLatestWith, map, of, Subject} from 'rxjs';
import {DbResult, Folder, KbTreeNode, listToTree, Snippet} from '@kb-rest/shared';
import {delay} from 'rxjs/operators';
import {NotificationService} from '../../../services/navigation/notification.service';

@Injectable({
  providedIn: 'root'
})
export class DemoService {

  private readonly notificationService = inject(NotificationService);
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
      if (this.searchQuery.value && !this.getCurrentSnippets().find(s => s.id === 99)) {
        return [...snippets, this.generateSnippet(99, 'Community note', 'This is a demo note from a community user that appears, when you search for content.', true, false)];
      }
      return snippets;
    }),
    delay(0),
  );
  snippetIdCounter = 4;

  communityUser$ = of(-1);

  loading$ = of(false);
  hasMore$ = of(false);

  folders: Folder[] = [
    {id: 1, name: 'home', parent_id: null},
    {id: 2, name: 'work', parent_id: null},
  ];
  treeNodes: KbTreeNode[] = [];
  treeNodes$ = new BehaviorSubject<KbTreeNode[]>(
    listToTree(this.folders)
  );

  addingFolder$ = new Subject<boolean>();
  folderIdCounter = 3;

  selectedFolderId$ = new BehaviorSubject<number>(null);

  renameComplete$ = new Subject<boolean>();
  deleteComplete$ = new Subject<boolean>();

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
      this.selectedFolderId$.next(null);
      this.currentFolder.next(null);
      return;
    }
    // console.log('set selected folder', folder)
    this.selectedFolderId$.next(folder.id);
    this.currentFolder.next({...folder, isFolder: true, childNodes: null});
  }

  /**
   * @param map movedFolderId -> targetFolderId
   */
  moveFolders(map: Map<number, number>) {
    map.forEach((targetFolderId, movedFolderId) => {
      const folderIndex = this.folders.findIndex(f => f.id === movedFolderId);
      if (folderIndex !== -1) {
        this.folders[folderIndex] = {
          ...this.folders[folderIndex],
          parent_id: targetFolderId
        };
      }
    });
    this.treeNodes = listToTree(this.folders);
    this.treeNodes$.next(this.treeNodes);
    this.updateResult.next({success: true});
    this.selectedFolderId$.next(this.selectedFolderId$.value);
  }

  renameFolder(folder: Folder) {
    this.renameComplete$.next(false);
    const index = this.folders.findIndex(f => f.id === folder.id);
    if (index !== -1) {
      this.folders[index] = {...this.folders[index], name: folder.name};
      this.treeNodes = listToTree(this.folders);
      this.treeNodes$.next(this.treeNodes);
    }
    setTimeout(() => this.renameComplete$.next(true), 0);
  }

  deleteFolder(folder: Folder) {
    this.deleteComplete$.next(false);
    const hasSubFolders = this.folders.some(f => f.parent_id === folder.id);
    if (hasSubFolders) {
      this.notificationService.error('Error', `Cannot delete folder that contains subfolders`);
      setTimeout(() => this.deleteComplete$.next(true), 0);
      return;
    }
    const hasSnippets = (this.snippets.get(folder.id) || []).length > 0;
    if (hasSnippets) {
      this.notificationService.error('Error', `Cannot delete folder that contains snippets`);
      setTimeout(() => this.deleteComplete$.next(true), 0);
      return;
    }
    this.folders = this.folders.filter(f => f.id !== folder.id);
    this.treeNodes = listToTree(this.folders);
    this.treeNodes$.next(this.treeNodes);
    if (this.selectedFolderId$.value === folder.id) {
      this.setSelectedFolder(null);
    }
    setTimeout(() => this.deleteComplete$.next(true), 0);
  }

  /**
   * @param map movedSnippetId -> targetFolderId
   */
  moveSnippets(map: Map<number, number>) {
    map.forEach((targetFolderId, movedSnippetId) => {
      // search for snippet
      this.snippets.forEach((snippets, sourceFolderId) => {
        const index = snippets.findIndex(s => s.id === movedSnippetId);
        if (index !== -1) {
          const foundSnippet = snippets[index];

          const sourceSnippets = this.snippets.get(sourceFolderId);
          if (sourceSnippets) {
            const filtered = sourceSnippets.filter(s => s.id !== movedSnippetId);
            this.snippets.set(sourceFolderId, filtered);
          }

          // add snippet to new folder
          const targetSnippets = this.snippets.get(targetFolderId) || [];
          targetSnippets.push(foundSnippet);
          this.snippets.set(targetFolderId, targetSnippets.sort((a,b) => a.title.localeCompare(b.title)));
        }
      });

      this.selectedFolderId$.next(this.selectedFolderId$.value);
    });

    this.refreshSnippets();
    this.treeNodes = listToTree(this.folders);
    this.treeNodes$.next(this.treeNodes);
  }

  addSnippet(snippet: Partial<Snippet>) {
    const snippets = this.getCurrentSnippets() || [];
    const newSnippet = this.generateSnippet(this.snippetIdCounter++, snippet.title, snippet.content, snippet.public);
    snippets.push(newSnippet);
    this.setCurrentSnippets(snippets);
    this.refreshSnippets();
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
      ufs_user: isOwn ? -1: 99,
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
      this.setCurrentSnippets(this.getCurrentSnippets().filter(s => s.id !== snippet.id));
      this.refreshSnippets();
      return;
    }
    if (!this.getCurrentSnippets()) {
      this.setCurrentSnippets([]);
    }
    this.getCurrentSnippets().push({...snippet, is_pinned: true});
    this.refreshSnippets();
  }

  deleteSnippet(snippet: Snippet) {
    const snippets = this.getCurrentSnippets();
    if (!snippets) {
      return;
    }
    const filtered = snippets.filter(s => s.id !== snippet.id);
    this.setCurrentSnippets(filtered);
    this.refreshSnippets();
  }

  editSnippet($event: Snippet) {
    const snippets = this.getCurrentSnippets();
    if (!snippets) {
      return;
    }
    const index = snippets.findIndex(s => s.id === $event.id);
    if (index !== -1) {
      snippets[index] = {...snippets[index], ...$event};
      this.setCurrentSnippets(snippets);
      this.refreshSnippets();
    }
  }

  togglePublic(snippet: Snippet) {
    this.editSnippet({...snippet, public: !snippet.public});
  }

  private refreshSnippets() {
    this.refreshSnippets$.next();
    this.updateResult.next({success: true});
  }

  private getCurrentSnippets() {
    return this.snippets.get(this.selectedFolderId$.value);
  }

  private setCurrentSnippets(snippets: Snippet[]) {
    this.snippets.set(this.selectedFolderId$.value, snippets);
  }
}
