import {Injectable} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {BehaviorSubject, distinctUntilChanged, filter, map, tap} from 'rxjs';
import {Folder} from '../../features/sidenav/api/folder';
import {PATH} from '../../utils/paths';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  //todo move all to sidenavService ?
  hideNav$ = this.router.events.pipe(
    filter(e => e instanceof NavigationEnd),
    map((e: NavigationEnd) => [PATH.LOGIN, PATH.COMMUNITY].map(p => '/' + p).includes(e.url)),
  );

  private selectedFolder = new BehaviorSubject<number>(undefined);
  selectedFolder$ = this.selectedFolder.pipe(
    //do not use distinctUntilChanged(), else the refresh will not work
  );

  /**
   * If you select a user in the community view and want to see his snippets,
   * the user's id will be set in this BehaviorSubject
   */
  private selectedUserId = new BehaviorSubject<number>(undefined);
  selectedUserId$ = this.selectedUserId.pipe(
    distinctUntilChanged()
  );

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
    this.activatedRoute.queryParams.pipe(
      filter(params => !!params),
      tap(params => {
        this.selectedFolder.next(params['folder'] || null);
        this.selectedUserId.next(+params['user'] || null);
      })
    ).subscribe();
  }

  setSelectedFolder(folder: Folder) {
    //selectedFolder$ listens to ActivatedRoute
    this.router.navigate(
      [],
      {
        relativeTo: this.activatedRoute,
        queryParams: {folder: folder?.id},
        queryParamsHandling: 'merge'
      }
    );
  }

  getSelectedFolder() {
    return this.selectedFolder.value;
  }

  refreshSelectedFolder() {
    this.selectedFolder.next(this.selectedFolder.value);
  }

}
