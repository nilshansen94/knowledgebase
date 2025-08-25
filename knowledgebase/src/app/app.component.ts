import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NavigationEnd, Router, RouterOutlet} from '@angular/router';
import {SidenavContainerComponent} from './features/sidenav/container/sidenav-container.component';
import {HeaderComponent} from './features/header/component/header.component';
import {AppService} from './services/app/app.service';
import {AuthService} from './services/auth/auth.service';
import {LoginService} from './features/login/service/login.service';
import {provideMarkdown} from 'ngx-markdown';
import {filter, map} from 'rxjs';
import {PATHS} from './utils/paths';
import {NotificationComponent} from './components/notification/notification.component';
import {NotificationService} from './services/navigation/notification.service';
import {ContextMenuComponent} from './components/context-menu/context-menu.component';
import {SidenavService} from './features/sidenav/service/sidenav.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SidenavContainerComponent,
    HeaderComponent,
    NotificationComponent,
    ContextMenuComponent,
  ],
  providers: [
    provideMarkdown({})
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(
    public appService: AppService,
    public loginService: LoginService,
    public authService: AuthService,
    private router: Router,
    public notificationService: NotificationService,
    private sidenavService: SidenavService,
  ) {}

  currentPath$ = this.router.events.pipe(
    filter(e => e instanceof NavigationEnd),
    map((e: NavigationEnd) => {
      if(e.url.startsWith('/' + PATHS.COMMUNITY)){
        return PATHS.COMMUNITY;
      }
      if(e.url.startsWith('/' + PATHS.LOGIN)){
        return PATHS.LOGIN;
      }
      if(e.url.startsWith('/' + PATHS.WELCOME)){
        return PATHS.WELCOME;
      }
      return PATHS.HOME;
    })
  );

  toggleSidenav() {
    this.sidenavService.toggleSidenav();
  }

}
