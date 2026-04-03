import {ChangeDetectionStrategy, Component, EventEmitter, inject, Input, Output} from '@angular/core';

import {SearchComponent} from '../../../components/search/search.component';
import {DbUser} from '../../../../../../backend/src/api';
import {KbTreeNode, Snippet, SnippetPinRequest} from '@kb-rest/shared';
import {SnippetComponent} from '../../snippets/component/snippet.component';
import {RouterLink} from '@angular/router';
import {ModalService} from '../../../services/modal/modal.service';
import {ModalModule} from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-community',
  standalone: true,
  imports: [SearchComponent, SnippetComponent, RouterLink, ModalModule],
  templateUrl: './community.component.html',
  styleUrls: ['./community.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommunityComponent {

  private readonly modalService = inject(ModalService);

  currentSearch = '';

  @Input()
  users: DbUser[]

  @Input()
  communitySnippets: Snippet[];

  @Input() folders: KbTreeNode[];

  @Output()
  searchSnippet = new EventEmitter<string>();

  @Output()
  pinSnippet = new EventEmitter<SnippetPinRequest>();

  searchForCommunitySnippets(search: string){
    this.currentSearch = search;
    this.searchSnippet.emit(search);
  }

  async doPinSnippet(snippet: Snippet) {
    const folder = await this.modalService.openSelectFolderModal({folders: this.folders});
    if(!folder){
      console.log('No folder selected');
      return;
    }
    const request: SnippetPinRequest = {
      snippetId: snippet.id,
      folder: folder.id,
      remove: false,
    };
    this.pinSnippet.emit(request);
  }

}
