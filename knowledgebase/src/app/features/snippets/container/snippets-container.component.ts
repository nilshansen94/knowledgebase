import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SnippetComponent} from "../component/snippet.component";
import {SnippetsService} from "../service/snippets.service";

@Component({
  selector: 'app-snippets-container',
  standalone: true,
  imports: [CommonModule, SnippetComponent],
  template: `
    <div class="snippets-container">
      <app-snippet *ngFor="let snippet of snippetsService.snippets$ | async" [snippet]="snippet" />
    </div>
  `,
  styles: [`
    .snippets-container {
      display: flex;
      flex-direction: row;
      gap: 1rem;
      flex-wrap: wrap;
    }
  `]
})
export class SnippetsContainerComponent {
  constructor(public snippetsService: SnippetsService) {}
}
