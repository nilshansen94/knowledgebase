import {Injectable} from '@angular/core';
import {MyHttpService} from '../http/my-http.service';
import {catchError, map, Observable, of, ReplaySubject, take, tap} from 'rxjs';

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

  //see https://stackoverflow.com/questions/67027172/subscribing-subject-in-guard-not-giving-response
  private isLoggedInSubject = new ReplaySubject<boolean>(1);

  public isLoggedIn$ = this.isLoggedInSubject.asObservable().pipe(
    tap(r => console.log('AuthService isLoggedIn$', r)),
  );

  private checkLogin$: Observable<boolean> = this.http.get('checkLogin').pipe(
    map((r: any) => r?.success === true),
    catchError(e => of(false)),
  );

  constructor(private http: MyHttpService) {
    this.checkLogin();
  }

  checkLogin() {
    this.checkLogin$.pipe(
      take(1),
      tap(r => {
        console.log('AuthService checkLogin result, setting subject', r);
        this.isLoggedInSubject.next(r);
      })
    ).subscribe()
  }

  setLoginState(isLoggedIn: boolean) {
    console.log('AuthService setLoginState', isLoggedIn);
    this.isLoggedInSubject.next(isLoggedIn);
  }

}
