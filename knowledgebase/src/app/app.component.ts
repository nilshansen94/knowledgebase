import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterOutlet} from '@angular/router';
import {SidenavComponent} from "./features/sidenav/component/sidenav.component";
import {SidenavContainerComponent} from "./features/sidenav/container/sidenav-container.component";
import {SnippetsContainerComponent} from "./features/snippets/container/snippets-container.component";
import {HeaderComponent} from "./features/header/component/header.component";
import {AppService} from "./services/app/app.service";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SidenavComponent,
    SidenavContainerComponent,
    SnippetsContainerComponent,
    HeaderComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(public appService: AppService) {}

}
