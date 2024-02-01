import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SidenavComponent} from "../component/sidenav.component";
import {SidenavService} from "../service/sidenav.service";
import {AppService} from "../../../services/app/app.service";

@Component({
  selector: 'app-sidenav-container',
  standalone: true,
  imports: [CommonModule, SidenavComponent],
  template: `
    <app-sidenav
      [navItems]="this.sidenavService.folders$ | async"
      [selectedItemId]="this.appService.selectedFolder$ | async"
      (selectedItemChange)="appService.setSelectedFolder($event)"
      (newFolder)="sidenavService.addFolder($event)"
      (movedFolders)="sidenavService.moveFolders($event)"
    />
  `,
  styles: [
  ]
})
export class SidenavContainerComponent {
  constructor(
    public sidenavService: SidenavService,
    public appService: AppService
  ) {}
}
