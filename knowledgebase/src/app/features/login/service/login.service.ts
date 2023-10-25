import {Injectable} from '@angular/core';
import {MyHttpService} from "../../../services/http/my-http.service";
import {take, tap} from "rxjs";
import {LoginData} from "../api/login-data";

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(
    private httpService: MyHttpService,
  ) {
    this.httpService.get('api').pipe(
      take(1),
      tap(r => console.log(r))
    ).subscribe();
  }

  login(data: LoginData) {
    this.httpService.post('login', data).pipe(
      tap(d => console.log(d))
    ).subscribe();
  }

}
