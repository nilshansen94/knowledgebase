import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class MyHttpService {

  baseUrl = 'http://localhost:3333/';

  constructor(private http: HttpClient) { }

  get(path: string) {
    return this.http.get(this.baseUrl + path);
  }

}
