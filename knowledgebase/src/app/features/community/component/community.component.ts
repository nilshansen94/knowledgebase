import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SearchComponent} from '../../../components/search/search.component';
import {DbUser} from '../../../../../../backend/src/api';
import {Snippet} from '../../snippets/api/snippet';
import {SnippetComponent} from '../../snippets/component/snippet.component';
import {RouterLink} from '@angular/router';
import {KbTreeNode} from '../../sidenav/api/kb-tree-node';
import {ModalService} from '../../../services/modal/modal.service';
import {ModalModule} from 'ngx-bootstrap/modal';
import {SnippetPinRequest} from '@kb-rest/shared';

@Component({
  selector: 'app-community',
  standalone: true,
  imports: [CommonModule, SearchComponent, SnippetComponent, RouterLink, ModalModule],
  templateUrl: './community.component.html',
  styleUrls: ['./community.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommunityComponent {

  constructor(private readonly modalService: ModalService) {}

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
    //TODO disallow "add folder" and "move folders"
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
