import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SidenavComponent} from "../component/sidenav.component";
import {SidenavService} from "../service/sidenav.service";

@Component({
  selector: 'app-sidenav-container',
  standalone: true,
  imports: [CommonModule, SidenavComponent],
  template: `
    <app-sidenav [navItems]="this.sidenavService.navItems$ | async" />
  `,
  styles: [
  ]
})
export class SidenavContainerComponent {
  constructor(public sidenavService: SidenavService) {}
}
