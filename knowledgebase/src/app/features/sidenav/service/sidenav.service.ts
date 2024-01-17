import { Injectable } from '@angular/core';
import {map, Observable, of, shareReplay, startWith, switchMap, tap} from "rxjs";
import {Folder} from "../api/folder";
import {HttpClient} from "@angular/common/http";
import {MyHttpService} from "../../../services/http/my-http.service";
import {AppService} from "../../../services/app/app.service";

@Injectable({
  providedIn: 'root'
})
export class SidenavService {


  constructor(
    private httpService: MyHttpService,
    private appService: AppService,
  ) {}

  navItems$: Observable<Partial<Folder>[]> = of([
    {name: 'Nav 1'},
    {name: 'Nav 2'},
  ]);

  folders$: Observable<Folder[]> = this.httpService.get('folders').pipe(
    shareReplay(),
    map(folders => folders as Folder[]),
    //map(folders => [{id: -1, name: '+'} as Folder, ...folders]),
    tap(f => console.log('folders$', f)),
  );

}
