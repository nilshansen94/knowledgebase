import {inject, Injectable} from '@angular/core';
import {MyHttpService} from '../../../services/http/my-http.service';
import {tap} from 'rxjs';
import {Router} from '@angular/router';
import {AuthService} from '../../../services/auth/auth.service';
import {PATHS} from '../../../utils/paths';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private readonly httpService = inject(MyHttpService);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  logout() {
    this.httpService.get('logout').pipe(
      tap(res => {
        this.authService.setLoginState(false);
        console.log('logout response', res);
        this.router.navigate([PATHS.WELCOME]);
      })
    ).subscribe();
  }

}
