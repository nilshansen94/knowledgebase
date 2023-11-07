import {Injectable} from '@angular/core';
import {MyHttpService} from '../../../services/http/my-http.service';
import {tap} from 'rxjs';
import {LoginRequest, RegistrationRequest} from '@kb-rest/shared';
import {sha256} from 'crypto-hash';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(
    private httpService: MyHttpService,
  ) {}

  async login(request: LoginRequest) {
    request.password = await sha256(request.password);
    this.httpService.post('login', request).pipe(
      tap(d => console.log('UI login result', d))
    ).subscribe();
  }

  async registration(request: RegistrationRequest) {
    request.password = await sha256(request.password);
    this.httpService.post('register', request).pipe(
      tap(r => console.log('UI registration result', r))
    ).subscribe();
  }

}
