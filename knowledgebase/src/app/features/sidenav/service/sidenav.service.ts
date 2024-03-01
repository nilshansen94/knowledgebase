import {Injectable} from '@angular/core';
import {map, Observable, startWith, switchMap, tap} from 'rxjs';
import {Folder} from '../api/folder';
import {MyHttpService} from '../../../services/http/my-http.service';
import {AppService} from '../../../services/app/app.service';
import {SnippetsService} from '../../snippets/service/snippets.service';
import {KbTreeNode} from '../api/kb-tree-node';
import {Snippet} from '../../snippets/api/snippet';

@Injectable({
  providedIn: 'root'
})
export class SidenavService {


  constructor(
    private httpService: MyHttpService,
    private appService: AppService,
    private snippetsService: SnippetsService,
  ) {}

  folders$: Observable<KbTreeNode[]> = this.snippetsService.snippets$.pipe(
    startWith([]),
    switchMap(snippets => this.httpService.get('folders').pipe(
      map(folders => ([snippets, folders]))
    )),
    map(([snippets, folders]: [Snippet[], Folder[]]) => {
      const snippetsByFolder = new Map<number, Snippet[]>();
      if(snippets){
        for(const snippet of snippets){
          if(!snippetsByFolder.has(snippet.folder)){
            snippetsByFolder.set(snippet.folder, []);
          }
          snippetsByFolder.get(snippet.folder).push(snippet);
        }
        this.addSnippetsToFolders(folders as KbTreeNode[], snippetsByFolder);
      }
      return folders as KbTreeNode[];
    })
  );

  addSnippetsToFolders(folders: KbTreeNode[], snippetMap: Map<number, Snippet[]>){
    for(const folder of folders){
      if(!folder.childNodes){
        folder.childNodes = [];
      }
      if(folder.childNodes.length > 0){
        this.addSnippetsToFolders(folder.childNodes, snippetMap);
      }
      const snippets = snippetMap.get(folder.id) || [];
      folder.childNodes = folder.childNodes.concat(snippets.map(snippet => ({name: snippet.title, id: snippet.id}) as KbTreeNode));
    }
  }

  addFolder(folder: Folder){
    this.httpService.put('addFolder', folder).pipe(
      tap(res => console.log(res)),
      switchMap(() => this.folders$)
    ).subscribe();
  }

  moveFolders(map: Map<number, Folder>) {
    const data = Array.from(map.entries()).map(([k, v]) => [v.parent_id, k]);
    console.log(data);
    this.httpService.post('moveFolders', data).pipe(
      tap(res => {
        this.appService.refreshSelectedFolder();
      })
    ).subscribe();
  }

  moveSnippets(map: Map<number, Folder>) {
    const data = Array.from(map.entries()).map(([k,v]) => [v.id, k]);
    this.httpService.post('moveSnippets', data).pipe(
      tap(res => {
        this.appService.refreshSelectedFolder();
      })
    ).subscribe();
  }

}
