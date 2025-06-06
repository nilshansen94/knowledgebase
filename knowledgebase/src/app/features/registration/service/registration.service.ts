import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {RegistrationRequest, RegistrationResponse} from '../api/registration.model';
import {MyHttpService} from '../../../services/http/my-http.service';

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {

  constructor(private readonly http: MyHttpService) {}

  checkUsername(username: string): Observable<boolean> {
    return this.http.get(`check-username/${username}`).pipe(
      map((response: {available: boolean}) => response.available),
    );
  }

  register(username: string): Observable<RegistrationResponse> {
    const request: RegistrationRequest = { username };
    return this.http.put('register', request).pipe(
      map(r => r as RegistrationResponse)
    );
  }
}
