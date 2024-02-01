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

  //we pipe from selectedFolder$ to allow a refresh
  folders$: Observable<Folder[]> = this.appService.selectedFolder$.pipe(
    startWith(null),
    switchMap(() => this.httpService.get('folders')),
    shareReplay(),
    map(folders => folders as Folder[]),
    //map(folders => [{id: -1, name: '+'} as Folder, ...folders]),
    tap(f => console.log('folders$', f)),
  );

  addFolder(folder: Folder){
    this.httpService.put('addFolder', folder).pipe(
      tap(res => console.log(res)),
      switchMap(() => this.folders$)
    ).subscribe();
  }

  moveFolders(map: Map<number, Folder>) {
    //todo at the moment we can only move folders but not snippets
    const data = Array.from(map.entries()).map(([k, v]) => [v.parent_id, k]);
    console.log(data);
    this.httpService.post('moveFolders', data).pipe(
      tap(res => {
        this.appService.refreshSelectedFolder();
      })
    ).subscribe();
  }

}
