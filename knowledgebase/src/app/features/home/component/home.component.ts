import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {LMarkdownEditorModule} from 'ngx-markdown-editor';
import {Snippet} from '../../snippets/api/snippet';
import {SnippetComponent} from '../../snippets/component/snippet.component';
import {DbResult} from '@kb-rest/shared';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, LMarkdownEditorModule, SnippetComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnChanges {

  addSnippet: boolean;
  editingSnippet: Snippet;
  newSnippetTitle: string;
  newSnippetContent: string;

  @Input()
  snippets: Snippet[];

  @Input()
  updateResult: DbResult;

  @Output()
  newSnippet = new EventEmitter<Partial<Snippet>>();

  @Output() editSnippet = new EventEmitter<Snippet>();

  @Output() deleteSnippet = new EventEmitter<Snippet>();

  ngOnChanges(changes: SimpleChanges) {
    if(changes['updateResult']?.currentValue) {
      const result: DbResult = changes['updateResult'].currentValue as DbResult;
      if(result.success){
        this.resetState();
      }
    }
  }

  saveSnippet() {
    console.log(this.newSnippetContent)
    this.newSnippet.emit({title: this.newSnippetTitle, content: this.newSnippetContent});
  }

  resetState() {
    this.addSnippet = false;
    this.editingSnippet = null;
    this.newSnippetTitle = '';
    this.newSnippetContent = '';
  }

  startEditingSnippet(snippet: Snippet) {
    this.editingSnippet = snippet;
    this.newSnippetContent = snippet.content;
    this.newSnippetTitle = snippet.title;
  }

  doEditSnippet() {
    this.editSnippet.emit({
      ...this.editingSnippet,
      title: this.newSnippetTitle,
      content: this.newSnippetContent
    })
  }

}
