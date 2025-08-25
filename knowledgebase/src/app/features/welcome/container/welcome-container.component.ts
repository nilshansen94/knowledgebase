import {Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {WelcomeComponent} from '../welcome.component';
import {AuthService} from '../../../services/auth/auth.service';

@Component({
  selector: 'kb-rest-welcome-container',
  imports: [CommonModule, WelcomeComponent],
  template: `
  <kb-rest-welcome [loggedIn]="authService.isLoggedIn$ | async" />
  `,
  styles: ``,
})
export class WelcomeContainerComponent {
  public authService = inject(AuthService);
}
