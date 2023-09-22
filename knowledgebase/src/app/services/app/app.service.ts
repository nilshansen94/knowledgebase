import {Injectable} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {Subject, filter, map, tap} from "rxjs";
import {Folder} from "../../features/sidenav/api/folder";

@Injectable({
  providedIn: 'root'
})
export class AppService {

  hideNav$ = this.router.events.pipe(
    filter(e => e instanceof NavigationEnd),
    map((e: NavigationEnd) => e.url === '/login'),
  );

  private selectedFolder = new Subject<Folder>();
  selectedFolder$ = this.selectedFolder.asObservable();

  constructor(
    private router: Router,
  ) {}

  setSelectedFolder(folder: Folder) {
    this.selectedFolder.next(folder);
  }

}
