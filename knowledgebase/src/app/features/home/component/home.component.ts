import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {LMarkdownEditorModule} from 'ngx-markdown-editor';
import {Snippet} from '../../snippets/api/snippet';
import {SnippetComponent} from '../../snippets/component/snippet.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, LMarkdownEditorModule, SnippetComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

  addSnippet: boolean;
  newSnippetTitle: string;
  newSnippetContent: string;

  @Input()
  snippets: Snippet[];

  @Output()
  newSnippet = new EventEmitter<Partial<Snippet>>();

  saveSnippet() {
    console.log(this.newSnippetContent)
    this.newSnippet.emit({title: this.newSnippetTitle, content: this.newSnippetContent});
  }

  resetState() {
    this.addSnippet = false;
    this.newSnippetTitle = '';
    this.newSnippetContent = '';
  }

}
