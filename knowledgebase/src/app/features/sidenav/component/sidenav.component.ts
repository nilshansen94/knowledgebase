import {ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, model, Output, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Folder} from '../api/folder';
import {ITreeOptions, TreeComponent, TreeModel, TreeModule, TreeNode} from '@odymaui/angular-tree-component';
import {FormsModule} from '@angular/forms';
import {KbTreeNode} from '../api/kb-tree-node';
import {Snippet} from '../../snippets/api/snippet';
import {ContextMenuItem} from '../../../components/context-menu/context-menu.component';
import {ContextMenuDirective} from '../../../components/context-menu/context-menu.directive';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [CommonModule, FormsModule, TreeModule, ContextMenuDirective],
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
  //todo onPush in all pure components !!
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidenavComponent {

  currentlySelectedItem: Folder;
  renamingNode: TreeNode | null = null;
  renamingNodeName: string = '';
  renamingInProgressNodeId: number | null = null;
  deletingInProgressNodeId: number | null = null;
  isAddingFolderInProgress = false;
  newFolderNode: KbTreeNode | null = null;

  firstNavItemsChange = true;

  //angular-tree docs: https://angular2-tree.readme.io/docs/drag-drop
  treeOptions: ITreeOptions = {
    childrenField: 'childNodes',
    allowDrag: (node) => node.data.id === -1 || this.allowMoveFolders,
    //todo allow drop to root
    allowDrop: (from, to) => to.parent.data.isFolder,
  };

  showAddFolderInput = false;
  folderNameToAdd: string;
  folderToDrag: Folder;
  folderPlaced: boolean;

  allowMoveFolders = false;
  navItemsBackupJson: string;
  /** mapping movedFolderId -> targetFolderId */
  movedFoldersMap = new Map<number, number>();
  /** mapping movedSnippet -> targetFolderId */
  movedSnippetsMap = new Map<number, number>();

  public _navItems: KbTreeNode[] = [];

  @ViewChild(TreeComponent)
  private tree: TreeComponent;

  @ViewChild('renameInput')
  private renameInput: ElementRef<HTMLInputElement>;

  @Input() set navItems(items: KbTreeNode[]) {
    if(this.allowMoveFolders) {
      return;
    }
    this._navItems = items;
    if(items) {
      this.updateTree();
    }
  }

  @Input() selectedItemId: number;

  @Input()
  snippets: Snippet[];

  @Input()
  selectedUserId: number;

  @Input()
  selectedUserName: string;

  @Input() set renameComplete(value: boolean) {
    if (value) {
      this.renamingInProgressNodeId = null;
    }
  }

  // this is needed for the case that the deletion failed
  // todo maybe add deletionInProgress property to folder
  @Input() set deleteComplete(value: boolean) {
    if (value) {
      this.deletingInProgressNodeId = null;
    }
  }

  @Input() set addingFolderInProgress(value: boolean) {
    if (!value) {
      this.cancelAddingFolder();
    }
  }

  @Output() selectedItemChange = new EventEmitter<Folder>();

  @Output() newFolder = new EventEmitter<Folder>();

  @Output() movedFolders = new EventEmitter<Map<number, number>>();

  @Output() movedSnippets = new EventEmitter<Map<number, number>>();

  @Output() deleteFolder = new EventEmitter<Folder>();
  @Output() renameFolder = new EventEmitter<Folder>();

  @Output() selectItem = new EventEmitter<number>();

  readonly contextMenuItems: ContextMenuItem[] = [
    {key: 'rename', label: 'Rename'},
    {key: 'delete', label: 'Delete'},
  ];

  showSidenav = model<boolean>();

  constructor() {}

  onContextMenuItemClick(node: TreeNode, item: ContextMenuItem) {
    const folder = node.data as Folder;
    switch (item.key) {
      case 'rename':
        this.doRenameFolder(node);
        break;
      case 'delete':
        if (!confirm(`Are you sure you want to delete the folder "${folder.name}"? This action cannot be undone.`)) {
          return;
        }
        this.deletingInProgressNodeId = folder.id;
        this.deleteFolder.emit(folder);
        break;
    }
  }

  doRenameFolder(node: TreeNode) {
    this.renamingNode = node;
    this.renamingNodeName = (node.data as Folder).name;
    setTimeout(() => {
      const input = this.renameInput?.nativeElement;
      if (input) {
        input.focus();
      }
    });
  }

  onRenameEnter(node: TreeNode) {
    const folder = node.data as Folder;
    const newName = this.renamingNodeName.trim();
    if (newName !== '' && newName !== folder.name) {
      this.renamingInProgressNodeId = folder.id;
      this.renameFolder.emit({...folder, name: newName});
    }
    this.renamingNode = null;
  }

  onRenameEscape() {
    this.renamingNode = null;
  }

  updateTree() {
    if (!this.tree) {
      return;
    }
    const folderId = new URLSearchParams(window.location.search).get('folder');
    this.tree.treeModel.setData({nodes: this._navItems, options: this.treeOptions, events: null});
    if (!folderId) {
      this.tree.treeModel.getActiveNode()?.setIsActive(false);
      this.tree.treeModel.update();
      return;
    }
    const node = this.tree.treeModel.getNodeById(folderId + '');
    if (node) {
      this.firstNavItemsChange = false;
      node.setActiveAndVisible();
    }
    this.tree.treeModel.update();
  }

  setSelectedItem(event: {eventName: 'activate' | 'deactivate', node: TreeNode, treeModel: TreeModel}) {
    const data = event.node.data;
    if (this.folderPlaced) {
      console.log('Ignoring selection of folder item because a new folder is being placed');
      return;
    }
    if (data.id === this.renamingNode?.id) {
      console.debug('ignore clicking on folder being renamed');
      return;
    }
    if (!data.isFolder) {
      //todo set parent folder as active (and maybe snippet)
      console.log('Ignore click on snippet so far', event);
      return;
    }
    if (event.eventName === 'deactivate') {
      this.currentlySelectedItem = undefined;
      this.selectedItemChange.emit(undefined);
      return;
    }
    event.node.expand();
    this.currentlySelectedItem = data;
    this.selectedItemChange.emit(data);
    //this.showSidenav.set(false);
  }

  addFolderDragItem() {
    const newFolder: KbTreeNode = {
      id: -1,
      isFolder: true,
      name: this.folderNameToAdd,
      parent_id: null,
      user_id: null,
      childNodes: null,
    };
    this.newFolderNode = newFolder;
    this._navItems.unshift(this.newFolderNode);
    this.tree.treeModel.update();
    this.folderPlaced = true;
    this.showAddFolderInput = false;
  }

  saveAddedFolder() {
    const newFolderNode = this.tree.treeModel.getNodeById(-1);
    const parent_id = newFolderNode.parent.data.virtual ? null : newFolderNode.parent.data.id;
    console.log(newFolderNode, parent_id);
    this.isAddingFolderInProgress = true;
    this.newFolder.emit({id: -1, name: newFolderNode.data.name, parent_id});
  }

  cancelAddingFolder() {
    this.isAddingFolderInProgress = false;
    this.folderPlaced = false;
    this.folderNameToAdd = '';
    // todo does not work for nested folders!
    if (this.newFolderNode) {
      const newFolderNode: TreeNode = this.tree.treeModel.getNodeById(-1);
      this.removeNode(newFolderNode.data);
      this.updateTree();
    }
    this.newFolderNode = null;
  }

  doAllowMoveFolders() {
    this.allowMoveFolders = true;
    this.backupNavItems();
  }

  backupNavItems() {
    this.navItemsBackupJson = JSON.stringify(this._navItems);
  }

  restoreNavItems() {
    this._navItems = JSON.parse(this.navItemsBackupJson);
    this.updateTree();
  }

  onDrop(e: {event: DragEvent, element: Snippet | any}, node: TreeNode) {
    //todo set movedFoldersMap and movedSnippetsMap, remove onMoveNode method
    //todo new folder was not placed in parent folder, but in root
    console.log(e, node)
    //was: html: onDrop($event)
    if (e.element instanceof TreeNode) {
      const itemToMove = e.element.data;
      const target = node.data;
      console.log('moving folder', itemToMove, target);
      if (!itemToMove.isFolder) {
        console.log('move snippet', itemToMove)
        const copy = {...itemToMove};
        this.removeNode(itemToMove);
        target.childNodes.push({...copy, parent_id: target.id});
        this.tree.treeModel.update();
        //todo if we move multiple snippets, this won't work. instead use map of snippet-id -> folder-id
        this.movedSnippetsMap.set(copy.id, target.id);
        return;
      }

      console.log('removeNode', itemToMove)
      console.log('removeNode', this._navItems.findIndex(n => n.id === itemToMove.id))
      const copy = {...itemToMove};
      if (copy.id === target.id) {
        console.log('Cancelling this move, you are trying to add a folder to itself.');
        return;
      }
      this.removeNode(itemToMove);

      target.childNodes.push({...copy, parent_id: target.id});
      this.tree.treeModel.update();
      this.movedFoldersMap.set(copy.id, target.id);
      return;
    }
    //add snippet from snippet list
    const snippet = e.element;
    const targetFolder = node.data as Folder;
    if(node.data.childNodes.find(e => e.id === snippet.id)){
      console.log('ignore dropping a snippet again');
      return;
    }
    node.data.childNodes.push({...snippet, name: snippet.title, parent_id: targetFolder.id});
    this.tree.treeModel.update();
    this.tree.treeModel.getNodeById(targetFolder.id).expand();
    this.movedSnippetsMap.set(snippet.id, targetFolder.id);
  }

  removeNode(node: Folder) {
    if (node.parent_id === null) {
      const index = this._navItems.findIndex(n => n.id === node.id);
      if (index >= 0) {
        this._navItems.splice(index, 1);
      }
    } else {
      const parent: Folder = this.tree.treeModel.getNodeById(node.parent_id).data;
      const i = parent.childNodes.findIndex(c => c.id === node.id);
      console.log('splice index', i)
      if (i >= 0) {
        parent.childNodes.splice(i, 1);
      }
    }
  }

  cancelMovingFolders() {
    this.movedFoldersMap.clear();
    this.movedSnippetsMap.clear();
    this.restoreNavItems();
    this.allowMoveFolders = false;
    this.tree.treeModel.update();
  }

  saveMovedFolders() {
    if (this.movedFoldersMap.size === 0 && this.movedSnippetsMap.size === 0) {
      this.cancelMovingFolders();
      return;
    }
    if (this.movedFoldersMap.size > 0) {
      this.movedFolders.emit(this.movedFoldersMap);
      this.movedFoldersMap.clear();
    }
    if (this.movedSnippetsMap.size > 0) {
      this.movedSnippets.emit(this.movedSnippetsMap);
      this.movedSnippetsMap.clear();
    }
    this.allowMoveFolders = false;
  }

  //todo scrollspy: https://giancarlobuomprisco.com/angular/intersection-observer-with-angular
  scrollToSnippet(id: number) {
    document.getElementById('snippet' + id).scrollIntoView({behavior: 'smooth'});
    this.selectItem.emit(id);
  }

}
