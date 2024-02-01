import {Injectable} from '@angular/core';
import {catchError, map, of, shareReplay, startWith, Subject, switchMap, tap} from 'rxjs';
import {MyHttpService} from '../../../services/http/my-http.service';
import {Snippet} from '../api/snippet';
import {AppService} from '../../../services/app/app.service';
import {ActivatedRoute} from '@angular/router';
import {DbResult} from '@kb-rest/shared';

@Injectable({
  providedIn: 'root'
})
export class SnippetsService {

  constructor(
    private httpService: MyHttpService,
    private appService: AppService,
    private route: ActivatedRoute,
  ) { }

   snippets$ = this.appService.selectedFolder$.pipe(
    startWith(null),
    map(folder => folder ? '/'+folder: ''),
    switchMap(folder => this.httpService.get('snippets' + folder)),
    catchError(e => {
      console.log('Cannot get snippets', e)
      return of([]);
    }),
    shareReplay(),
    //todo more db interfaces
    map(folders => folders as (Snippet & {folder: number})[])
  );

  private updateResult = new Subject<DbResult>();
  /** The result of an update or delete operation */
  updateResult$ = this.updateResult.asObservable();

  addSnippet(snippet: Partial<Snippet>) {
    const folder = +this.route.snapshot.queryParamMap.get('folder');
    if(!folder){
      alert('Please select a folder');
      return;
    }
    this.httpService.put('snippet', {title: snippet.title, content: snippet.content, folder}).pipe(
      tap(res => {
        this.appService.refreshSelectedFolder();
        this.updateResult.next(res as DbResult);
      }),
    ).subscribe();
  }

  editSnippet(snippet: Snippet) {
    this.httpService.post('snippet', snippet).pipe(
      tap(res => {
        this.appService.refreshSelectedFolder();
        this.updateResult.next(res as DbResult);
      })
    ).subscribe();
  }

  deleteSnippet(snippet: any) {
    this.httpService.delete('snippet', snippet.snip_id).pipe(
      tap(res => {
        this.appService.refreshSelectedFolder();
      })
    ).subscribe();
  }

}
