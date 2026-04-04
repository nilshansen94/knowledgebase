import {Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LoginPageComponent} from '../component/login-page/login-page.component';
import {AuthService} from '../../../services/auth/auth.service';
import {ActivatedRoute} from '@angular/router';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-login-container',
  standalone: true,
  imports: [CommonModule, LoginPageComponent],
  template: `
    <app-login-page
      [redirectedFromRegistration]="redirectedFromRegistration$ | async"
      (loginByGoogle)="oauth()"
    />
  `,
  styles: [
  ]
})
export class LoginContainerComponent {
  public readonly authService = inject(AuthService);
  private readonly activatedRoute = inject(ActivatedRoute);

  public redirectedFromRegistration$ = this.activatedRoute.queryParamMap.pipe(
    map(params => params.has('redirectedFromRegistration'))
  );

  public async oauth(){
    await this.authService.loginWithGoogle();
  }
}
