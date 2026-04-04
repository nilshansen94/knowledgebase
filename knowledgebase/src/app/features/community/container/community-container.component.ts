import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CommunityComponent} from '../component/community.component';
import {MyHttpService} from '../../../services/http/my-http.service';
import {BehaviorSubject, map, switchMap} from 'rxjs';
import {Snippet, User} from '@kb-rest/shared';
import {SidenavService} from '../../sidenav/service/sidenav.service';
import {SnippetsService} from '../../snippets/service/snippets.service';

@Component({
  selector: 'app-community-container',
  standalone: true,
  imports: [CommonModule, CommunityComponent],
  template: `
    <app-community
      [users]="users$ | async"
      [communitySnippets]="communitySnippets$ | async"
      [folders]="sidenavService.folders$ | async"
      (searchSnippet)="searchSnippet($event)"
      (pinSnippet)="snippetService.pinCommunitySnippet($event)"
    />
  `,
  styles: [
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommunityContainerComponent {

  public readonly httpService = inject(MyHttpService);
  public readonly sidenavService = inject(SidenavService);
  public readonly snippetService = inject(SnippetsService);

  private readonly searchCommunitySnippet = new BehaviorSubject<string>('');

  users$ = this.httpService.get('users').pipe(
    map(users => users as User[])
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
