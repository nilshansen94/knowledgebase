import {ChangeDetectionStrategy, Component, EventEmitter, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPageComponent {

  //https://console.cloud.google.com

  @Output()
  loginByGoogle = new EventEmitter<void>();

  constructor() {}

}
