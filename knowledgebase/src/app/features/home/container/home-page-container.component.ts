import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {HomeComponent} from '../component/home.component';
import {SnippetsService} from '../../snippets/service/snippets.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, HomeComponent],
  template: `
    <h1>My Snippets</h1>
    <app-home
      [snippets]="snippetsService.snippets$ | async"
      [updateResult]="snippetsService.updateResult$ | async"
      (newSnippet)="snippetsService.addSnippet($event)"
      (editSnippet)="snippetsService.editSnippet($event)"
      (deleteSnippet)="snippetsService.deleteSnippet($event)"
      (search)="snippetsService.searchSnippet($event)"
    />
  `,
  styles: [
  ]
})
export class HomePageContainerComponent {

  constructor(public snippetsService: SnippetsService) {}

}
