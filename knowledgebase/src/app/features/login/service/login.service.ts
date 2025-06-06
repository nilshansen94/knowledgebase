import {Injectable} from '@angular/core';
import {MyHttpService} from '../../../services/http/my-http.service';
import {tap} from 'rxjs';
import {Router} from '@angular/router';
import {AuthService} from '../../../services/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(
    private httpService: MyHttpService,
    private router: Router,
    private authService: AuthService,
  ) {}

  logout() {
    this.httpService.get('logout').pipe(
      tap(res => {
        this.authService.setLoginState(false);
        console.log('logout response', res);
        this.router.navigate(['login']);
      })
    ).subscribe();
  }

}
