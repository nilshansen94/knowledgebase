import {Component, DestroyRef, EventEmitter, inject, Input, OnInit, Output} from '@angular/core';
import {BsModalRef} from 'ngx-bootstrap/modal';
import {SidenavComponent} from '../../features/sidenav/component/sidenav.component';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {tap} from 'rxjs';
import {Folder, KbTreeNode} from '@kb-rest/shared';

@Component({
  selector: 'app-modal-folder-selection',
  imports: [
    SidenavComponent
  ],
  templateUrl: './modal-folder-selection.component.html',
  styleUrl: './modal-folder-selection.component.scss'
})
export class ModalFolderSelectionComponent implements OnInit {
  public readonly bsModalRef = inject(BsModalRef);
  private readonly destroyRef = inject(DestroyRef);

  selectedFolder: Folder;

  @Input() folders: KbTreeNode[];

  @Output() save: EventEmitter<Folder|null> = new EventEmitter();

  ngOnInit() {
    this.bsModalRef.onHide?.pipe(
      takeUntilDestroyed(this.destroyRef),
      tap(() => this.save.emit(null))
    ).subscribe();
  }

  closeModal() {
    this.save.emit(null);
    this.bsModalRef.hide();
  }

  onSelectFolder(folder: Folder) {
    console.log('selected folder', folder);
    this.selectedFolder = folder;
  }

  saveFolder() {
    console.log('save folder', this.selectedFolder);
    this.save.emit(this.selectedFolder);
    this.bsModalRef.hide();
  }
}
