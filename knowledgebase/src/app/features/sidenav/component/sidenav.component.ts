import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Folder} from "../api/folder";
import {ITreeOptions, TreeComponent, TreeModule, TreeNode} from "@odymaui/angular-tree-component";

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [CommonModule, TreeModule],
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnChanges {

  currentlySelectedItem: Folder;

  firstNavItemsChange = true;

  //angular-tree docs: https://angular2-tree.readme.io/docs
  treeOptions: ITreeOptions = {
    childrenField: 'childNodes',
  };

  @ViewChild(TreeComponent)
  private tree: TreeComponent;

  @Input() navItems: Folder[];

  @Input() selectedItemId: number;

  @Output() selectedItemChange = new EventEmitter<Folder>();

  ngOnChanges(changes: SimpleChanges) {
    if(changes['navItems']?.currentValue && this.firstNavItemsChange){
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
    }
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

}
