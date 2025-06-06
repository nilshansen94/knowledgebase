import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SidenavComponent} from '../component/sidenav.component';
import {SidenavService} from '../service/sidenav.service';
import {AppService} from '../../../services/app/app.service';
import {SnippetsService} from '../../snippets/service/snippets.service';
import {Folder} from '../api/folder';
import {catchError, tap} from 'rxjs/operators';
import {NotificationService} from '../../../services/navigation/notification.service';

@Component({
  selector: 'app-sidenav-container',
  standalone: true,
  imports: [CommonModule, SidenavComponent],
  template: `
    <app-sidenav
      [navItems]="this.sidenavService.folders$ | async"
      [selectedItemId]="this.appService.selectedFolder$ | async"
      [snippets]="snippetService.snippets$ | async"
      [selectedUserId]="appService.selectedUserId$ | async"
      [selectedUserName]="sidenavService.selectedUserName$ | async"
      [renameComplete]="renameComplete"
      [deleteComplete]="deleteComplete"
      [addingFolderinProgress]="sidenavService.addingFolderInProgress$ | async"
      [showSidenav]="sidenavService.showSidenav$ | async"
      (showSidenavChange)="sidenavService.toggleSidenav()"
      (selectedItemChange)="appService.setSelectedFolder($event)"
      (newFolder)="addFolder($event)"
      (movedFolders)="sidenavService.moveFolders($event)"
      (movedSnippets)="sidenavService.moveSnippets($event)"
      (renameFolder)="renameFolder($event)"
      (deleteFolder)="deleteFolder($event)"
      (selectItem)="snippetService.setSelectedSnippet($event)"
    />
  `,
  styles: []
})
export class SidenavContainerComponent {
  renameComplete = false;
  deleteComplete = false;

  constructor(
    public sidenavService: SidenavService,
    public appService: AppService,
    public snippetService: SnippetsService,
    private notificationService: NotificationService,
  ) {}

  public renameFolder(folder: Folder) {
    this.renameComplete = false;
    this.sidenavService.renameFolder(folder).pipe(
      // todo add property to folder to add wait animation
      //  now the animation disappears and then you are still waiting for the folders to be reloaded
      tap(() => this.renameComplete = true),
    ).subscribe();
  }

  public deleteFolder(folder: Folder) {
    this.deleteComplete = false;
    this.sidenavService.deleteFolder(folder.id).pipe(
      tap((response: any) => {
        if (response.error) {
          this.notificationService.error('Error', response.error);
          this.deleteComplete = true;
        }
        //do not set deleteComplete to true if successful, folder will disappear after reloading folders
      }),
      catchError(error => {
        this.notificationService.error('Error', 'An unexpected error occurred while deleting the folder.');
        this.deleteComplete = true;
        throw error;
      })
    ).subscribe();
  }

  public addFolder(folder: Folder) {
    this.sidenavService.addFolder(folder).pipe(
      catchError(error => {
        this.notificationService.error('Error', 'An unexpected error occurred while adding the folder.');
        throw error;
      })
    ).subscribe();
  }
}
