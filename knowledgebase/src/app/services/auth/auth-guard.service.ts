import {Injectable} from '@angular/core';
import {AuthService} from './auth.service';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {map, Observable, tap} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean|UrlTree> {
    return this.authService.isLoggedIn$.pipe(
      tap(isLoggedIn => console.log('guard has isLoggedIn$', isLoggedIn)),
      map(isLoggedIn => isLoggedIn ? true: this.router.parseUrl('login')),
    )
  }

}
