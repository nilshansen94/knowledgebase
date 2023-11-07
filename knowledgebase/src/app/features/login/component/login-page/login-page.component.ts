import {Component, EventEmitter, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {LoginRequest, RegistrationRequest} from '@kb-rest/shared';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent {

  @Output()
  login = new EventEmitter<LoginRequest>();

  @Output()
  registration = new EventEmitter<RegistrationRequest>();

  constructor(private fb: FormBuilder) {}

  loginForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
    email: ['']
  });

  submitLogin() {
    this.login.emit({
      user: this.loginForm.value.username,
      password: this.loginForm.value.password,
    });
  }

  submitRegistration(e) {
    this.registration.emit({
      user: this.loginForm.value.username,
      password: this.loginForm.value.password,
      email: this.loginForm.value.email,
    });
    e.preventDefault();
  }

}
