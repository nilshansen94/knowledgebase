import {Component, EventEmitter, Input, Output} from '@angular/core';
import { CommonModule } from '@angular/common';
import {Folder} from "../api/folder";

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent {

  currentlySelectedItem: Folder;

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
