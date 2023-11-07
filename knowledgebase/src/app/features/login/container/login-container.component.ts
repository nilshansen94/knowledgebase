import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {LoginPageComponent} from "../component/login-page/login-page.component";
import {LoginService} from "../service/login.service";

@Component({
  selector: 'app-login-container',
  standalone: true,
  imports: [CommonModule, LoginPageComponent],
  template: `
    <app-login-page
      (login)="loginService.login($event)"
      (registration)="loginService.registration($event)"
    />
  `,
  styles: [
  ]
})
export class LoginContainerComponent {

  constructor(public loginService: LoginService) {}

}
