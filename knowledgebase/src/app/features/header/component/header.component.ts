import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';

import {RouterLink} from '@angular/router';
import {PATHS} from 'knowledgebase/src/app/utils/paths';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
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

  @Input() communityUserName: string;

  emitLogout() {
    this.logout.emit();
  }

}
