import {Component, DestroyRef, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {BsModalRef} from 'ngx-bootstrap/modal';
import {KbTreeNode} from '../../features/sidenav/api/kb-tree-node';
import {SidenavComponent} from '../../features/sidenav/component/sidenav.component';
import {Folder} from '../../features/sidenav/api/folder';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {tap} from 'rxjs';

@Component({
  selector: 'kb-rest-modal-folder-selection',
  imports: [
    SidenavComponent
  ],
  templateUrl: './modal-folder-selection.component.html',
  styleUrl: './modal-folder-selection.component.scss'
})
export class ModalFolderSelectionComponent implements OnInit {

  constructor(
    public bsModalRef: BsModalRef,
    private readonly destroyRef: DestroyRef,
    ) {}

  selectedFolder: Folder;

  @Input() folders: KbTreeNode[];

  @Output() onSave: EventEmitter<Folder|null> = new EventEmitter();

  ngOnInit() {
    this.bsModalRef.onHide?.pipe(
      takeUntilDestroyed(this.destroyRef),
      tap(() => this.onSave.emit(null))
    ).subscribe();
  }

  closeModal() {
    this.onSave.emit(null);
    this.bsModalRef.hide();
  }

  onSelectFolder(folder: Folder) {
    console.log('selected folder', folder);
    this.selectedFolder = folder;
  }

  saveFolder() {
    console.log('save folder', this.selectedFolder);
    this.onSave.emit(this.selectedFolder);
    this.bsModalRef.hide();
  }
}
