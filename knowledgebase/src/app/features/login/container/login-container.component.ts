import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {LoginPageComponent} from "../component/login-page/login-page.component";

@Component({
  selector: 'app-login-container',
  standalone: true,
  imports: [CommonModule, LoginPageComponent],
  template: `
    <app-login-page />
  `,
  styles: [
  ]
})
export class LoginContainerComponent {

}
