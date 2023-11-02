import {Injectable} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {filter, map, Observable} from "rxjs";
import {Folder} from "../../features/sidenav/api/folder";

@Injectable({
  providedIn: 'root'
})
export class AppService {

  hideNav$ = this.router.events.pipe(
    filter(e => e instanceof NavigationEnd),
    map((e: NavigationEnd) => e.url === '/login'),
  );

  selectedFolder$: Observable<number> = this.activatedRoute.queryParams.pipe(
    map(params => params['folder'] ? params['folder']: undefined)
  );

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {}

  setSelectedFolder(folder: Folder) {
    //selectedFolder$ listens to ActivatedRoute
    this.router.navigate(
      [],
      {
        relativeTo: this.activatedRoute,
        queryParams: {folder: folder?.id},
        //queryParamsHandling: 'merge'
      }
    );
  }

}
