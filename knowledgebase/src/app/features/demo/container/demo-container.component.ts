import {Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HomeComponent} from '../../home/component/home.component';
import {DemoService} from '../service/demo.service';

@Component({
  selector: 'app-demo-container',
  imports: [CommonModule, HomeComponent],
  styles: ``,
  template: `
  <h1>Demo</h1>
  <app-home
    [snippets]="demoService.snippets$ | async"
    [updateResult]="demoService.updateResult$ | async"
    [currentFolder]="demoService.currentFolder$ | async"
    [communityUser]="demoService.communityUser$ | async"
    [loading]="demoService.loading$ | async"
    [hasMore]="demoService.hasMore$ | async"
    [selectedSnippetId]="null"
    [hasFolders]="(demoService.treeNodes$ | async).length > 0"
    (newSnippet)="demoService.addSnippet($event)"
    (searchChange)="demoService.search($event)"
    (pinSnippet)="demoService.pinSnippet($event)"
    (deleteSnippet)="demoService.deleteSnippet($event)"
    (editSnippet)="demoService.editSnippet($event)"
    (togglePublic)="demoService.togglePublic($event)"
  />`,
})
export class DemoContainerComponent {
  public demoService = inject(DemoService);
}
