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
    console.debug('http-get', this.baseUrl + path)
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

  delete(path: string, id: number) {
    const fullPath = this.baseUrl + path + '/' + id;
    console.debug('http-delete', fullPath);
    return this.http.delete(fullPath, this.options);
  }

}
