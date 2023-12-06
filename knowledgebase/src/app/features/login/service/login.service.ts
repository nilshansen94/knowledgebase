import {Injectable} from '@angular/core';
import {MyHttpService} from '../../../services/http/my-http.service';
import {tap} from 'rxjs';
import {LoginRequest, RegistrationRequest} from '@kb-rest/shared';
import {sha256} from 'crypto-hash';
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

  async login(request: LoginRequest) {
    request.password = await sha256(request.password);
    this.httpService.post('login', request).pipe(
      //todo api
      tap((result: {success: boolean}) => {
        console.log('UI login result', result);
        if(result.success === true){
          this.authService.setLoginState(true);
          console.log('navigating to home ("")')
          this.router.navigate(['']).then(r => console.log('navigate result', r)).catch(e => console.log('navigate failed', e))
          return;
        }
        console.warn('Login failed');
      })
      //todo catch and show result
    ).subscribe();
  }

  async registration(request: RegistrationRequest) {
    request.password = await sha256(request.password);
    this.httpService.post('register', request).pipe(
      tap(r => console.log('UI registration result', r))
    ).subscribe();
  }

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
