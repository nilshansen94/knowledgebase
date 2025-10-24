import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MyHttpService {

  baseUrl = environment.baseUrl;

  options = {withCredentials: true};

  constructor(private http: HttpClient) {
  }

  get(path: string) {
    return this.http.get(this.baseUrl + path, this.options);
  }

  get2<T>(path: string): Observable<T> {
    return this.http.get<T>(this.baseUrl + path, this.options);
  }

  post(path: string, data: any) {
    return this.http.post(this.baseUrl + path, data, this.options);
  }

  put(path: string, data: any) {
    return this.http.put(this.baseUrl + path, data, this.options);
  }

  delete(path: string, id: number) {
    const fullPath = this.baseUrl + path + '/' + id;
    return this.http.delete(fullPath, this.options);
  }

}
