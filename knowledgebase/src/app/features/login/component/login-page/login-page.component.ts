import {Component, EventEmitter, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, ReactiveFormsModule, Validators} from "@angular/forms";
import {LoginData} from "../../api/login-data";

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent {

  @Output()
  login = new EventEmitter<LoginData>();

  constructor(private fb: FormBuilder) {}

  loginForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  submitLogin() {
    this.login.emit({
      username: this.loginForm.value.username,
      password: this.loginForm.value.password,
    });
  }

}
