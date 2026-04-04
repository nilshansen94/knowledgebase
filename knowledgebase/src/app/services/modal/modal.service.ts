import {inject, Injectable} from '@angular/core';
import {BsModalService, ModalOptions} from 'ngx-bootstrap/modal';
import {Folder, KbTreeNode} from '@kb-rest/shared';
import {ModalFolderSelectionComponent} from '../../components/modal-folder-selection/modal-folder-selection.component';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private readonly modalService = inject(BsModalService);

  openSelectFolderModal(state: {folders: KbTreeNode[]}): Promise<Folder>{
    const initialState: ModalOptions = {
      initialState: {
        ...state,
        allowAddFolder: false,
      }
    };
    const bsModalRef = this.modalService.show(ModalFolderSelectionComponent, initialState);
    return new Promise<Folder>((resolve, reject) => bsModalRef.content.save.subscribe(result => resolve(result)));
  }

}
