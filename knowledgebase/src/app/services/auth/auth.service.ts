import {Injectable} from '@angular/core';
import {MyHttpService} from '../http/my-http.service';
import {catchError, map, Observable, of, ReplaySubject, take, tap} from 'rxjs';
import {environment} from '../../../environments/environment';


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

  async loginWithGoogle() {
    window.location.href = environment.OAUTH_CALLBACK_URL;
  }

  checkLoginOauth(){
    this.http.get('checkLogin').subscribe((r: any) => {
      console.log('checkLogin', r);
    })
  }
}
