import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Folder} from '../api/folder';
import {ITreeOptions, TreeComponent, TreeModel, TreeModule, TreeNode} from '@odymaui/angular-tree-component';
import {FormsModule} from '@angular/forms';
import {KbTreeNode} from '../api/kb-tree-node';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [CommonModule, TreeModule, FormsModule],
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
  //todo onPush in all pure components !!
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidenavComponent implements OnChanges {

  currentlySelectedItem: Folder;

  firstNavItemsChange = true;

  //angular-tree docs: https://angular2-tree.readme.io/docs/drag-drop
  treeOptions: ITreeOptions = {
    childrenField: 'childNodes',
    allowDrag: (node) => node.data.id === -1 || this.allowMoveFolders,
    allowDrop: (from, to) => to.parent.data.isFolder,
  };

  showAddFolderInput = false;
  folderNameToAdd: string;
  folderToAdd: Folder;//folder that will be saved in db
  folderToDrag: Folder;
  folderPlaced: boolean;

  allowMoveFolders = false;
  navItemsBackupJson: string;
  movedFoldersMap = new Map<number, Folder>();
  movedSnippetsMap = new Map<number, Folder>();

  @ViewChild(TreeComponent)
  private tree: TreeComponent;

  @Input() navItems: KbTreeNode[];

  @Input() selectedItemId: number;

  @Output() selectedItemChange = new EventEmitter<Folder>();

  @Output() newFolder = new EventEmitter<Folder>();

  @Output() movedFolders = new EventEmitter<Map<number, Folder>>();

  @Output() movedSnippets = new EventEmitter<Map<number, Folder>>();

  ngOnChanges(changes: SimpleChanges) {
    if(changes['navItems']?.currentValue){
      this.updateTree();
    }
  }

  updateTree() {
    const folderId = new URLSearchParams(window.location.search).get('folder');
    if(!folderId){
      return;
    }
    this.tree.treeModel.setData({nodes: this.navItems, options: this.treeOptions, events: null})
    const node = this.tree.treeModel.getNodeById(folderId + '');
    if(node){
      this.firstNavItemsChange = false;
      node.setActiveAndVisible();
    }
    this.tree.treeModel.update();
  }

  setSelectedItem(event: {eventName: 'activate'|'deactivate', node: TreeNode, treeModel: TreeModel}) {
    const data = event.node.data;
    if(this.folderPlaced){
      console.log('Ignoring selection of folder item because a new folder is being placed');
      return;
    }
    if(!data.isFolder){
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
    //this.newFolder.emit(newFolder);
    this.navItems.unshift(newFolder)
    this.tree.treeModel.update();
    this.folderPlaced = true;
    this.showAddFolderInput = false;
  }

  saveAddedFolder(){
    const newFolderNode = this.tree.treeModel.getNodeById(-1);
    const parent_id = newFolderNode.parent.data.virtual ? null: newFolderNode.parent.data.id;
    this.newFolder.emit({id: -1, name: newFolderNode.data.name, parent_id});
  }

  doAllowMoveFolders() {
    this.allowMoveFolders = true;
    this.navItemsBackupJson = JSON.stringify(this.navItems);
  }

  onMoveNode(e){
    e.node.parent_id = e.to.parent.virtual ? null: e.to.parent.id;
    e.node.isMoved = true;
    if(e.node.isFolder){
      this.movedFoldersMap.set(e.node.id, e.node);
    }
    if(!e.node.isFolder){
      this.movedSnippetsMap.set(e.node.id, e.to.parent);
    }
    this.tree.treeModel.getNodeById(e.to.parent.id).expand();
    this.tree.treeModel.update();
  }

  cancelMovingFolders() {
    this.movedFoldersMap.clear();
    this.movedSnippetsMap.clear();
    this.navItems = JSON.parse(this.navItemsBackupJson);
    this.allowMoveFolders = false;
    this.tree.treeModel.update();
  }

  saveMovedFolders() {
    if (this.movedFoldersMap.size === 0 && this.movedSnippetsMap.size === 0) {
      this.cancelMovingFolders();
      return;
    }
    if(this.movedFoldersMap.size > 0){
      this.movedFolders.emit(this.movedFoldersMap);
      this.movedFoldersMap.clear();
    }
    if(this.movedSnippetsMap.size > 0) {
      this.movedSnippets.emit(this.movedSnippetsMap);
      this.movedSnippetsMap.clear();
    }
    this.allowMoveFolders = false;
  }

}
