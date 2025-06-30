import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [
    ReactiveFormsModule,
  ],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegistrationComponent {
  @Input() isValid = false;
  @Input() errorMessage = '';
  @Output() usernameChange = new EventEmitter<string>();
  @Output() register = new EventEmitter<string>();

  usernameControl = new FormControl('', [
    Validators.required,
    Validators.minLength(5),
    Validators.pattern('^[a-zA-Z0-9_]+$'),
  ]);

  constructor() {}

  onRegister() {
    if (this.usernameControl.value && this.isValid) {
      this.register.emit(this.usernameControl.value);
    }
  }

  emitUsername(username: string) {
    if(username){
      this.usernameChange.emit(username);
    }
  }
}
