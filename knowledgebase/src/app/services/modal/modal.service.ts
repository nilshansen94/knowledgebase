import {Injectable} from '@angular/core';
import {BsModalService, ModalOptions} from 'ngx-bootstrap/modal';
import {Folder, KbTreeNode} from '@kb-rest/shared';
import {ModalFolderSelectionComponent} from '../../components/modal-folder-selection/modal-folder-selection.component';

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  constructor(private readonly modalService: BsModalService) { }

  openSelectFolderModal(state: {folders: KbTreeNode[]}): Promise<Folder>{
    const initialState: ModalOptions = {
      initialState: {
        ...state,
        allowAddFolder: false,
      }
    };
    const bsModalRef = this.modalService.show(ModalFolderSelectionComponent, initialState);
    return new Promise<Folder>((resolve, reject) => bsModalRef.content.onSave.subscribe(result => resolve(result)));
  }

}
