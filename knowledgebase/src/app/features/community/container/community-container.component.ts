import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CommunityComponent} from '../component/community.component';
import {MyHttpService} from '../../../services/http/my-http.service';
import {BehaviorSubject, map, switchMap} from 'rxjs';
import {DbUser} from '../../../../../../backend/src/api';
import {Snippet} from '../../snippets/api/snippet';
import {SidenavService} from '../../sidenav/service/sidenav.service';
import {SnippetsService} from '../../snippets/service/snippets.service';

@Component({
  selector: 'app-community-container',
  standalone: true,
  imports: [CommonModule, CommunityComponent],
  template: `
    <h1>Community</h1>
    <app-community
      [users]="users$ | async"
      [communitySnippets]="communitySnippets$ | async"
      [folders]="sidenavService.folders$ | async"
      (searchSnippet)="searchSnippet($event)"
      (pinSnippet)="snippetService.pinCommunitySnippet($event)"
    />
  `,
  styles: [
  ]
})
export class CommunityContainerComponent {

  constructor(
    public httpService: MyHttpService,
    public sidenavService: SidenavService,
    public snippetService: SnippetsService,
  ) {}

  private searchCommunitySnippet = new BehaviorSubject<string>('');

  users$ = this.httpService.get('users').pipe(
    map(users => users as DbUser[])
  );

  communitySnippets$ = this.searchCommunitySnippet.pipe(
    map(search => this.mapSearchQuery(search)),
    switchMap(search => {
      return this.httpService.get('communitySnippets' + search);
    }),
    map(snippets => snippets as Snippet[]),
  );

  searchSnippet(searchString: string){
    this.searchCommunitySnippet.next(searchString);
  }

  //todo gibts auch im snippet-service
  private mapSearchQuery(val) {
    return val ? '?' + new URLSearchParams({search: val}).toString() : '';
  }

}
