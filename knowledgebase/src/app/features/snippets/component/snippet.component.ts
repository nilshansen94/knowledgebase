import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Snippet} from '../api/snippet';
import {MarkdownComponent} from 'ngx-markdown';

@Component({
  selector: 'app-snippet',
  standalone: true,
  imports: [CommonModule, MarkdownComponent],
  templateUrl: './snippet.component.html',
  styleUrls: ['./snippet.component.scss']
})
export class SnippetComponent {

  confirmDelete = false;

  @Input() snippet: Snippet;

  @Output() editSnippet = new EventEmitter<Snippet>();

  @Output() deleteSnippet = new EventEmitter<Snippet>();

  doEditSnippet() {
    this.editSnippet.emit(this.snippet);
  }

  doDeleteSnippet() {
    if(!this.confirmDelete){
      this.confirmDelete = true;
      return;
    }
    this.deleteSnippet.emit(this.snippet);
  }

}
