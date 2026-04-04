import {Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {WelcomeComponent} from '../welcome.component';
import {AuthService} from '../../../services/auth/auth.service';

@Component({
  selector: 'app-welcome-container',
  standalone: true,
  imports: [CommonModule, WelcomeComponent],
  template: `
  <app-welcome [loggedIn]="authService.isLoggedIn$ | async" />
  `,
  styles: ``,
})
export class WelcomeContainerComponent {
  public authService = inject(AuthService);
}
