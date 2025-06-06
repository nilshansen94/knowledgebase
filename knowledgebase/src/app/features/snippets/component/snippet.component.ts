import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Snippet} from '../api/snippet';
import {MarkdownComponent} from 'ngx-markdown';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-snippet',
  standalone: true,
  imports: [CommonModule, MarkdownComponent, RouterLink],
  templateUrl: './snippet.component.html',
  styleUrls: ['./snippet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SnippetComponent {

  confirmDelete = false;
  pendingRequest = false;

  @Input() canEdit: boolean;

  @Input() pinWithModal: boolean;

  @Input() snippet: Snippet;

  @Output() editSnippet = new EventEmitter<Snippet>();

  @Output() deleteSnippet = new EventEmitter<Snippet>();

  @Output() togglePublic = new EventEmitter<Snippet>();

  /** pin or unpin snippet */
  @Output() pinSnippet = new EventEmitter<Snippet>();

  doEditSnippet() {
    this.editSnippet.emit(this.snippet);
  }

  doDeleteSnippet() {
    if(!this.confirmDelete){
      this.confirmDelete = true;
      return;
    }
    this.pendingRequest = true;
    this.deleteSnippet.emit(this.snippet);
  }

  togglePublicSnippet(){
    this.togglePublic.emit(this.snippet);
  }

  doPinSnippet() {
    //todo what to do when the modal is cancelled
    this.pendingRequest = true;
    this.pinSnippet.emit(this.snippet);
  }

}
