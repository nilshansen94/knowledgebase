import {Injectable} from '@angular/core';
import {map, shareReplay, startWith, switchMap, tap} from "rxjs";
import {MyHttpService} from "../../../services/http/my-http.service";
import {Snippet} from "../api/snippet";
import {AppService} from "../../../services/app/app.service";
import {Folder} from "../../sidenav/api/folder";

@Injectable({
  providedIn: 'root'
})
export class SnippetsService {

  constructor(
    private httpService: MyHttpService,
    private appService: AppService,
  ) { }

  private lorem = `Lorem ipsum dolor sit amet, consetetur sadipscing elitr,
  sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,
  sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.
  Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
  Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor
  invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et
  justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. `;

  snippets$ = this.appService.selectedFolder$.pipe(
    startWith(null),
    map(folder => folder ? '/'+folder.id: ''),
    switchMap(folder => this.httpService.get('snippets/1' + folder)),
    shareReplay(),
    map(folders => folders as Snippet[])
  );

}
