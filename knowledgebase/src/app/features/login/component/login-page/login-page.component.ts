import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';

import {ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPageComponent {

  @Input()
  redirectedFromRegistration: boolean;

  @Output()
  loginByGoogle = new EventEmitter<void>();

  constructor() {}

}
