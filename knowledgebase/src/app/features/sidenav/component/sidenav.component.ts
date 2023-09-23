import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Folder} from "../api/folder";
import {ITreeOptions, TreeModule} from "@odymaui/angular-tree-component";

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [CommonModule, TreeModule],
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent {

  currentlySelectedItem: Folder;

  //angular-tree docs: https://angular2-tree.readme.io/docs
  treeOptions: ITreeOptions = {
    childrenField: 'childNodes',
  };

  @Input() navItems: Folder[];

  @Output() selectedItem = new EventEmitter<Folder>();

  setSelectedItem(folder: Folder) {
    if (this.currentlySelectedItem?.id === folder.id) {
      this.currentlySelectedItem = undefined;
      this.selectedItem.emit(undefined);
      return;
    }
    this.currentlySelectedItem = folder;
    this.selectedItem.emit(folder);
  }

}
