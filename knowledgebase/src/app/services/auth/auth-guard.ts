import {CanActivateFn, Router} from '@angular/router';
import {AuthService} from './auth.service';
import {inject} from '@angular/core';
import {map, tap} from 'rxjs';

export function authGuard(): CanActivateFn {
  return () => {
    const authService: AuthService = inject(AuthService);
    const router: Router = inject(Router);
    return authService.isLoggedIn$.pipe(
      tap(isLoggedIn => console.log('guard has isLoggedIn$', isLoggedIn)),
      map(isLoggedIn => isLoggedIn ? true: router.parseUrl('login'))
    );
  }
}
