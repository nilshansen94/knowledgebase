import {Injectable} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {BehaviorSubject, filter, map} from 'rxjs';
import {Folder} from '../../features/sidenav/api/folder';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  //todo move all to sidenavService ?
  hideNav$ = this.router.events.pipe(
    filter(e => e instanceof NavigationEnd),
    map((e: NavigationEnd) => e.url === '/login'),
  );

  private selectedFolder = new BehaviorSubject<number>(undefined);
  selectedFolder$ = this.selectedFolder.asObservable();

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
    this.activatedRoute.queryParams.pipe(
      map(params => params['folder'] ? params['folder']: null)
    ).subscribe(folder => this.selectedFolder.next(folder));
  }

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

  refreshSelectedFolder() {
    this.selectedFolder.next(this.selectedFolder.value);
  }

}
