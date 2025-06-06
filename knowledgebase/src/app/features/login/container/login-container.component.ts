import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LoginPageComponent} from '../component/login-page/login-page.component';
import {AuthService} from '../../../services/auth/auth.service';

@Component({
  selector: 'app-login-container',
  standalone: true,
  imports: [CommonModule, LoginPageComponent],
  template: `
    <app-login-page
      (loginByGoogle)="oauth()"
    />
  `,
  styles: [
  ]
})
export class LoginContainerComponent {

  constructor(
    public authService: AuthService,
  ) { }

  public async oauth(){
    await this.authService.loginWithGoogle();
  }
}
