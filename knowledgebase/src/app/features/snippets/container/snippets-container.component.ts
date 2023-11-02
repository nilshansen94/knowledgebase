import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SnippetComponent} from "../component/snippet.component";
import {SnippetsService} from "../service/snippets.service";
import {LMarkdownEditorModule} from "ngx-markdown-editor";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-snippets-container',
  standalone: true,
  imports: [
    CommonModule,
    SnippetComponent,
    LMarkdownEditorModule,
    FormsModule,
  ],
  template: `
    <div class="editor">
      <button *ngIf="!addSnippet" (click)="addSnippet = !addSnippet">add Snippet</button>
      <input type="text" *ngIf="addSnippet" placeholder="title" [(ngModel)]="newSnippetTitle">
      <md-editor
        *ngIf="addSnippet"
        [(ngModel)]="newSnippetContent"
      />
      <button *ngIf="addSnippet" (click)="saveSnippet()">save</button>
    </div>
    <div class="snippets-container">
      <app-snippet *ngFor="let snippet of snippetsService.snippets$ | async" [snippet]="snippet" />
    </div>
  `,
  styles: [`
    .editor {
      margin-bottom: 1rem;
      & input {
        margin-bottom: 0.5rem;
      }
    }
    .snippets-container {
      display: flex;
      flex-direction: row;
      gap: 1rem;
      flex-wrap: wrap;
    }
  `]
})
export class SnippetsContainerComponent {

  addSnippet: boolean;
  newSnippetTitle: string;
  newSnippetContent: string;

  constructor(
    public snippetsService: SnippetsService,
  ) {}

  saveSnippet() {
    console.log(this.newSnippetContent)
    this.snippetsService.addSnippet(this.newSnippetTitle, this.newSnippetContent)
  }
}
