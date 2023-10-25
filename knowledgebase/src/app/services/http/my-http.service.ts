import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class MyHttpService {

  baseUrl = 'http://localhost:3333/';

  options = {withCredentials: true};

  constructor(private http: HttpClient) { }

  get(path: string) {
    return this.http.get(this.baseUrl + path, this.options);
  }

  post(path: string, data: any) {
    return this.http.post(this.baseUrl + path, data, this.options);
  }

}
