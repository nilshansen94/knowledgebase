import {Component, ElementRef, HostListener, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ContextMenuService} from './context-menu.service';

export interface ContextMenuItem {
  key: string;
  label: string;
}

@Component({
  selector: 'app-context-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './context-menu.component.html',
  styleUrls: ['./context-menu.component.scss']
})
export class ContextMenuComponent {

  private readonly elementRef = inject(ElementRef);
  private readonly contextMenuService = inject(ContextMenuService);

  state$ = this.contextMenuService.state$;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.contextMenuService.close();
    }
  }

  onItemClick(item: ContextMenuItem) {
    this.contextMenuService.onItemClick(item);
  }
}
