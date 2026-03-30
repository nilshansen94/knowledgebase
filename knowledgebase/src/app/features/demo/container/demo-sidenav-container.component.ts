import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SidenavComponent} from '../../sidenav/component/sidenav.component';
import {DemoService} from '../service/demo.service';
import {SidenavService} from '../../sidenav/service/sidenav.service';
import {Folder} from '@kb-rest/shared';

@Component({
  selector: 'app-demo-sidenav-container',
  standalone: true,
  imports: [CommonModule, SidenavComponent],
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-sidenav
      [navItems]="this.demoService.treeNodes$ |async"
      [selectedItemId]="demoService.selectedFolderId$ | async"
      [snippets]="demoService.snippets$ | async"
      [allowAddFolder]="true"
      [selectedUserName]=""
      [renameComplete]="demoService.renameComplete$ | async"
      [deleteComplete]="demoService.deleteComplete$ | async"
      [addingFolderInProgress]="demoService.addingFolder$ |async"
      [showSidenav]="sidenavService.showSidenav$ | async"
      (newFolder)="demoService.addFolder($event)"
      (selectedItemChange)="selectedItemChange($event)"
      (movedFolders)="demoService.moveFolders($event)"
      (movedSnippets)="demoService.moveSnippets($event)"
      (deleteFolder)="demoService.deleteFolder($event)"
      (renameFolder)="demoService.renameFolder($event)"
    />`,
})
export class DemoSidenavContainerComponent {

  public readonly demoService = inject(DemoService);
  public sidenavService = inject(SidenavService);
  private readonly isMobile: boolean;

  constructor() {
    this.isMobile = window.innerWidth < 768;
  }

  protected selectedItemChange(event: Folder) {
    this.demoService.setSelectedFolder(event);
    if(this.isMobile) {
      this.sidenavService.hideSidenav();
    }

  }
}
