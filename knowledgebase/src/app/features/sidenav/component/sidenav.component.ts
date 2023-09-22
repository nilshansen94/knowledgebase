import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {NavItem} from "./api/nav-item";

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent {

  @Input() navItems: NavItem[];

}
