import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, NavigationEnd, Router, RouterOutlet} from '@angular/router';
import {SidenavContainerComponent} from './features/sidenav/container/sidenav-container.component';
import {HeaderComponent} from './features/header/component/header.component';
import {AppService} from './services/app/app.service';
import {AuthService} from './services/auth/auth.service';
import {LoginService} from './features/login/service/login.service';
import {provideMarkdown} from 'ngx-markdown';
import {combineLatestWith, filter, map, of, switchMap} from 'rxjs';
import {PATHS} from './utils/paths';
import {NotificationComponent} from './components/notification/notification.component';
import {NotificationService} from './services/navigation/notification.service';
import {ContextMenuComponent} from './components/context-menu/context-menu.component';
import {SidenavService} from './features/sidenav/service/sidenav.service';
import {MyHttpService} from './services/http/my-http.service';
import {DemoSidenavContainerComponent} from './features/demo/container/demo-sidenav-container.component';

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
    DemoSidenavContainerComponent,
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
    private activatedRoute: ActivatedRoute,
    private http: MyHttpService,
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
      if(e.url.startsWith('/' + PATHS.PROFILE)){
        return PATHS.PROFILE;
      }
      return PATHS.HOME;
    })
  );

  communityUserName$ = this.currentPath$.pipe(
    combineLatestWith(this.activatedRoute.queryParamMap),
    map(([path, params]) => {
      if(path === PATHS.HOME && params.has('user')) {
        return + params.get('user');
      }
      return -1;
    }),
    switchMap(userId => {
      if(userId < 0) {
        return of(null);
      }
      return this.http.get2<{name: string}>('username/' + userId);
    }),
    map(res => res?.name),
  );

  toggleSidenav() {
    this.sidenavService.toggleSidenav();
  }

}
