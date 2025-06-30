import {Component, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HomeComponent} from '../component/home.component';
import {SnippetsService} from '../../snippets/service/snippets.service';
import {SidenavService} from '../../sidenav/service/sidenav.service';
import {AppService} from '../../../services/app/app.service';
import {ActivatedRoute} from '@angular/router';
import {map, tap} from 'rxjs/operators';
import {PagingService} from '../../snippets/service/paging.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, HomeComponent],
  template: `
    <h1>{{ (sidenavService.currentFolder$ | async)?.name || 'My Snippets' }}</h1>
    <app-home
        [snippets]="snippetsService.snippets$ | async"
        [updateResult]="snippetsService.updateResult$ | async"
        [currentFolder]="sidenavService.currentFolder$ | async"
        [communityUser]="communityUser$ | async"
        [loading]="pagingService.loading$ | async"
        [hasMore]="pagingService.hasMore$ | async"
        [selectedSnippetId]="snippetsService.selectedSnippet$ | async"
        [hasFolders]="sidenavService.hasFolders$ | async"
        (loadMore)="snippetsService.loadMore()"
        (newSnippet)="snippetsService.addSnippet($event)"
        (editSnippet)="snippetsService.editSnippet($event)"
        (deleteSnippet)="snippetsService.deleteSnippet($event)"
        (togglePublic)="snippetsService.togglePublicSnippet($event)"
        (pinSnippet)="sidenavService.pinSnippet($event)"
        (search)="snippetsService.searchSnippet($event)"
    />
  `,
  styles: [
  ]
})
export class HomePageContainerComponent implements OnInit, OnDestroy {

  constructor(
    public appService: AppService,
    public snippetsService: SnippetsService,
    public pagingService: PagingService,
    public sidenavService: SidenavService,
    private acitvatedRoute: ActivatedRoute,
  ) {}

  communityUser$ = this.acitvatedRoute.queryParamMap.pipe(
    map(queryParamMap => {
      const user = queryParamMap.get('user');
      if(!user){
        return -1;
      }
      return +user;
    }),
    tap(p => console.log('communityUser$', p)),
  );

  ngOnInit() {
    this.snippetsService.resetPaging();
  }

  ngOnDestroy() {
    this.snippetsService.searchSnippet(null);
  }



}
