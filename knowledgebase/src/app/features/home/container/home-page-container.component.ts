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
      (newSnippet)="snippetsService.addSnippet($event)"
    />
  `,
  styles: [
  ]
})
export class HomePageContainerComponent {

  constructor(public snippetsService: SnippetsService,) {}

}
