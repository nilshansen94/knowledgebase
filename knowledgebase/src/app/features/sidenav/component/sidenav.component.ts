import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Folder} from '../api/folder';
import {ITreeOptions, TreeComponent, TreeModel, TreeModule, TreeNode} from '@odymaui/angular-tree-component';
import {FormsModule} from '@angular/forms';

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

  //angular-tree docs: https://angular2-tree.readme.io/docs
  treeOptions: ITreeOptions = {
    childrenField: 'childNodes',
    allowDrag: true,
    actionMapping: {
      mouse: {
        drop: (tree, node, $event, {from, to}) => {
          if(!this.folderPlaced) {
            this.addFolderToTree(from, to);
          } else {
            this.moveAddedFolderInTree(from, to);
          }
        }
      }
    }
  };

  folderNameToAdd: string;
  folderToAdd: Folder;//folder that will be saved in db
  folderToDrag: Folder;
  folderPlaced: boolean;

  @ViewChild(TreeComponent)
  private tree: TreeComponent;

  @Input() navItems: Folder[];

  @Input() selectedItemId: number;

  @Output() selectedItemChange = new EventEmitter<Folder>();

  @Output() newFolder = new EventEmitter<Folder>();

  ngOnChanges(changes: SimpleChanges) {
    if(changes['navItems']?.currentValue && this.firstNavItemsChange){
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

  setSelectedItem(folder: TreeNode&Folder) {
    if (this.currentlySelectedItem?.id === folder.id) {
      this.currentlySelectedItem = undefined;
      this.selectedItemChange.emit(undefined);
      return;
    }
    folder.expand();
    this.currentlySelectedItem = folder;
    this.selectedItemChange.emit(folder);
  }

  addFolderDragItem() {
    const newFolder: Folder = {
      id: -1,
      name: this.folderNameToAdd,
      parent_id: null,
      user_id: null,
      childNodes: null,
    };
    //this.newFolder.emit(newFolder);
    this.folderToDrag = newFolder;
    this.folderPlaced = false;
  }

  addFolderToTree(from, to) {
    //from: type Folder, id=-1, parent_id=null, user_id=(noch) null
    //to: {index: 1, parent: {data: {id: 123132, virtual: true} (auch noch index..)}}
    const parent: Folder = to.parent.data;
    console.log('drag', from, to); // from === {name: 'first'}
    //if(to.dropOnNode){
    if(!to.parent.data.virtual){
      console.log('dropOnNode', from, to)
      //parent.childNodes.push(from);
      parent.childNodes.splice(to.index, 0, from);
      to.parent.treeModel.getNodeById(to.parent.data.id).expandAll();
      this.folderToAdd = from;
    } else {
      console.log('push to tree', to)
      //insert at index with splice(index, 0, newElement)
      const folderToAdd = {id: -1, name: from.name, parent_id: -1, user_id: parent.user_id};
      this.navItems.splice(to.index, 0, folderToAdd);
      this.folderToAdd = folderToAdd;
      //this.navItems.push({id: -1, name: from.name, parent_id: -1, user_id: parent.user_id} as Folder);
    }
    this.tree.treeModel.update();
    //todo use same logic as in backend..
    this.folderToDrag = null;
    this.folderPlaced = true;
    console.log(this.navItems)
    //this.updateTree();
    // Add a node to `to.parent` at `to.index` based on the data in `from`
    // Then call tree.update()
  }

  moveAddedFolderInTree(from, to) {
    //from: index: 1, data: Folder, treeModel
    //to: {index: 1, parent: {data, treeModel, children, index})
    const parent: Folder = to.parent.data;
    if (!to.parent.data.virtual) {
      console.log('move folder in tree, to node', from, to)
      from.data.parentId = to.parent.data.id;
      parent.childNodes.push(from.data);
      this.folderToAdd = from.data;
      console.log('removing item:', from.parent.data.childNodes, from.parent.data.childNodes.filter((node, i) => i !== from.index), from.index)
      from.parent.data.childNodes = from.parent.data.childNodes.filter((node, i) => i !== from.index)
      this.tree.treeModel.update();
      const toModel = to.parent.treeModel as TreeModel;
      toModel.expandAll();
    } else {
      console.log('move folder in tree, to root', from, to)
      //console.log('removing item:', from.parent.data.childNodes, from.parent.data.childNodes.filter((node, i) => i !== from.index), from.index)
      //todo maybe use from.treeModel.nodes (hat die Einträge mit den Folders) (wenn man von root aus moved)
      from.parent.data.childNodes = from.parent.data.childNodes.filter((node, i) => i !== from.index)
      //this.navItems.push(from.data);
      this.folderToAdd = from.data;
      this.navItems.splice(to.index, 0, from.data);
    }
    this.tree.treeModel.update();
  }

  saveAddedFolder(){
    //todo add parent-id when dropping/moving around
    console.log(this.folderToAdd)
  }

}
