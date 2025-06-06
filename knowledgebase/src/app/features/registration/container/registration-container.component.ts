import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {RegistrationComponent} from '../component/registration.component';
import {RegistrationService} from '../service/registration.service';
import {catchError, filter, map, of, Subject, switchMap} from 'rxjs';
import {RegistrationResponse} from '../api/registration.model';
import {AsyncPipe} from '@angular/common';

@Component({
  selector: 'app-registration-container',
  template: `
    <app-registration
      [isValid]="(validationState$ | async)?.isValid || false"
      [errorMessage]="(validationState$ | async)?.errorMessage || ''"
      (usernameChange)="usernameSubject$.next($event)"
      (register)="registerSubject$.next($event)"
    ></app-registration>
  `,
  imports: [RegistrationComponent, AsyncPipe]
})
export class RegistrationContainerComponent {
  public readonly usernameSubject$ = new Subject<string>();
  public readonly registerSubject$ = new Subject<string>();

  validationState$ = this.usernameSubject$.pipe(
    filter(username => !!username),
    switchMap(username => {
      return this.registrationService.checkUsername(username).pipe(
        map(isAvailable => ({
          isValid: isAvailable,
          errorMessage: isAvailable ? '' : 'Username is already taken'
        })),
        catchError(() => of({ isValid: false, errorMessage: 'Error checking username availability' }))
      );
    })
  );

  registration$ = this.registerSubject$.pipe(
    filter(username => !!username),
    switchMap(username =>
      this.registrationService.register(username).pipe(
        map((response: RegistrationResponse) => {
          if (response.success) {
            this.router.navigate(['/']);
          }
          return response;
        }),
        catchError(() => of({ success: false, message: 'Error during registration' }))
      )
    )
  );

  constructor(
    private readonly registrationService: RegistrationService,
    private readonly router: Router
  ) {
    this.registration$.subscribe();
  }
}
