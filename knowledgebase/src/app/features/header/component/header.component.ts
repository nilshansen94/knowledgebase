import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';
import {PATHS} from 'knowledgebase/src/app/utils/paths';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {

  PATH = PATHS;

  @Input()
  currentPath: string;

  @Input()
  isLoggedIn: boolean;

  @Output()
  logout = new EventEmitter<void>();

  @Output()
  toggleSidenav = new EventEmitter<void>();

  emitLogout() {
    this.logout.emit();
  }

}
