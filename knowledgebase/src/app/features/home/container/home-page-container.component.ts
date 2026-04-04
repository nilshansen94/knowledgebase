import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HomeComponent} from '../component/home.component';
import {SnippetsService} from '../../snippets/service/snippets.service';
import {SidenavService} from '../../sidenav/service/sidenav.service';
import {AppService} from '../../../services/app/app.service';
import {ActivatedRoute} from '@angular/router';
import {delay, map, tap} from 'rxjs/operators';
import {PagingService} from '../../snippets/service/paging.service';
import {Snippet} from '@kb-rest/shared';
import {take} from 'rxjs';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, HomeComponent],
  template: `
    <h1>{{ (sidenavService.currentFolder$ | async)?.name || 'My knowledgebase' }}</h1>
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
        (editSnippet)="editSnippet($event)"
        (deleteSnippet)="snippetsService.deleteSnippet($event)"
        (togglePublic)="togglePublicSnippet($event)"
        (pinSnippet)="sidenavService.pinSnippet($event)"
        (searchChange)="snippetsService.searchSnippet($event)"
    />
  `,
  styles: [
  ]
})
export class HomePageContainerComponent implements OnInit, OnDestroy {

  public readonly appService = inject(AppService);
  public readonly snippetsService = inject(SnippetsService);
  public readonly pagingService = inject(PagingService);
  public readonly sidenavService = inject(SidenavService);
  private readonly activatedRoute = inject(ActivatedRoute);

  communityUser$ = this.activatedRoute.queryParamMap.pipe(
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

  editSnippet(snippet: Snippet) {
    this.snippetsService.editSnippet$(snippet).subscribe();
    this.animateUpdatedSnippet(snippet.id);
  }

  togglePublicSnippet(snippet: Snippet) {
    this.snippetsService.togglePublicSnippet$(snippet).subscribe();
    this.animateUpdatedSnippet(snippet.id);
  }

  private animateUpdatedSnippet(snippetId: number) {
    this.snippetsService.updateResult$.pipe(
      take(1),
      delay(300),
    ).subscribe(() => {
      const ele = document.getElementById('snippet' + snippetId);
      ele.scrollIntoView({behavior: 'smooth'});
      ele.classList.add('active');
      setTimeout(() => {
        ele.classList.remove('active');
      }, 1500)
    });
  }

}
