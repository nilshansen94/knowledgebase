import {Injectable} from '@angular/core';
import {catchError, map, of, shareReplay, startWith, switchMap, take, tap} from 'rxjs';
import {MyHttpService} from "../../../services/http/my-http.service";
import {Snippet} from "../api/snippet";
import {AppService} from "../../../services/app/app.service";
import {ActivatedRoute} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class SnippetsService {

  constructor(
    private httpService: MyHttpService,
    private appService: AppService,
    private route: ActivatedRoute,
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
    map(folder => folder ? '/'+folder: ''),
    switchMap(folder => this.httpService.get('snippets' + folder)),
    catchError(e => {
      console.log('Cannot get snippets', e)
      return of([]);
    }),
    shareReplay(),
    map(folders => folders as Snippet[])
  );

  addSnippet(snippet: Partial<Snippet>) {
    const folder = +this.route.snapshot.queryParamMap.get('folder');
    if(!folder){
      alert('Please select a folder');
      return;
    }
    this.httpService.put('snippet', {title: snippet.title, content: snippet.content, folder}).pipe(
      tap(res => {
        console.log(res);
        this.appService.refreshSelectedFolder();
      }),
    ).subscribe();
  }

}
