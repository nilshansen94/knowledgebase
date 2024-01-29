import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterOutlet} from '@angular/router';
import {SidenavComponent} from './features/sidenav/component/sidenav.component';
import {SidenavContainerComponent} from './features/sidenav/container/sidenav-container.component';
import {HeaderComponent} from './features/header/component/header.component';
import {AppService} from './services/app/app.service';
import {AuthService} from './services/auth/auth.service';
import {LoginService} from './features/login/service/login.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SidenavComponent,
    SidenavContainerComponent,
    HeaderComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(
    public appService: AppService,
    public loginService: LoginService,
    public authService: AuthService,
  ) {}

}
