import {Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SidenavComponent} from '../../sidenav/component/sidenav.component';
import {DemoService} from '../service/demo.service';

@Component({
  selector: 'app-demo-sidenav-container',
  imports: [CommonModule, SidenavComponent],
  styles: ``,
  template: `
    <app-sidenav
      [navItems]="this.demoService.treeNodes$ |async"
      [selectedItemId]="demoService.selectedFolderId$ | async"
      [snippets]="demoService.snippets$ | async"
      [allowAddFolder]="true"
      [selectedUserName]=""
      [renameComplete]=""
      [deleteComplete]=""
      [addingFolderInProgress]="demoService.addingFolder$ |async"
      [showSidenav]="true"
      (newFolder)="demoService.addFolder($event)"
      (selectedItemChange)="demoService.setSelectedFolder($event)"
      (movedFolders)="demoService.moveFolders($event)"
      (movedSnippets)="demoService.moveSnippets($event)"
    />`,
})
export class DemoSidenavContainerComponent {
  public demoService = inject(DemoService);
}
