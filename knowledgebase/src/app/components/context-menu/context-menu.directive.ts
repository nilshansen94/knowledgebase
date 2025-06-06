import {Directive, ElementRef, EventEmitter, HostListener, Input, Output} from '@angular/core';
import {ContextMenuItem} from './context-menu.component';
import {ContextMenuService} from './context-menu.service';
import {take, takeUntil} from 'rxjs/operators';

@Directive({
  selector: '[appContextMenu]',
  standalone: true
})
export class ContextMenuDirective {
  @Input() contextMenuItems: ContextMenuItem[] = [];
  @Input() contextMenuEnabled = true;

  @Output() contextMenuClick = new EventEmitter<ContextMenuItem>();

  constructor(
    private elementRef: ElementRef,
    private contextMenuService: ContextMenuService
  ) {}

  @HostListener('contextmenu', ['$event'])
  onContextMenu(event: MouseEvent) {
    if (!this.contextMenuEnabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    this.contextMenuService.itemClicked$
      .pipe(
        take(1),
        takeUntil(this.contextMenuService.closed$)
      )
      .subscribe(item => {
        this.contextMenuClick.emit(item);
      });
    this.contextMenuService.show(event.pageX, event.pageY, this.contextMenuItems);
  }
}
