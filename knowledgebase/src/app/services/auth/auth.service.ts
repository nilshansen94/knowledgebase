import {Injectable} from '@angular/core';
import {MyHttpService} from '../http/my-http.service';
import {catchError, map, Observable, of} from 'rxjs';

/**
 * Security concept:
 *
 ** register: DB:
 * pw = bcrypt(salt, pw)
 * [username, email, salt, pw, secret=null]
 ** with no cookie yet:
 * UI: user, pw
 * -- (bcrypt pw) -->
 ** backend: generate secret (uuid)
 * in DB: secret = bcrypt(secret + userAgent)
 * -- (generated-secret) -->
 * UI stores secrete in cookie
 ** login:
 *  UI: user, pw ---(bcrypt pw)-->
 *  check username + bcrypt(salt, pw)
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  loggedIn$: Observable<boolean> = this.http.get('checkLogin').pipe(
    map((r: any) => r?.success === true),
    catchError(e => of(false)),
  );

  constructor(private http: MyHttpService) {
    this.loggedIn$.subscribe(l => console.log('loggedIn:', l))
  }

}
