import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MyHttpService {

  baseUrl = 'http://localhost:3333/';

  options = {withCredentials: true};

  constructor(private http: HttpClient) { }

  get(path: string) {
    console.debug('http-get', path)
    return this.http.get(this.baseUrl + path, this.options);
  }

  post(path: string, data: any) {
    console.debug('http-post', path, data)
    return this.http.post(this.baseUrl + path, data, this.options);
  }

  put(path: string, data: any) {
    console.debug('http-put', path, data)
    return this.http.put(this.baseUrl + path, data, this.options);
  }

}
