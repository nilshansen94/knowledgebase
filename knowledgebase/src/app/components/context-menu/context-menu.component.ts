import {Component, ElementRef, HostListener} from '@angular/core';
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
  state$ = this.contextMenuService.state$;

  constructor(
    private elementRef: ElementRef,
    private contextMenuService: ContextMenuService
  ) {}

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
