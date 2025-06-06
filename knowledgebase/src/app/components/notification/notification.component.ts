import {Component, computed, input, output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Notification} from '../../services/navigation/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent {
  notifications = input.required<Notification[]>();
  close = output<number>();
  clearAll = output<void>();

  showClearAll = computed(() => (this.notifications()?.length ?? 0) >= 2);

  closeNotification(id: number): void {
    this.close.emit(id);
  }

  clearAllNotifications(): void {
    this.clearAll.emit();
  }

  handleNotificationClick(event: MouseEvent, id: number): void {
    if (event.shiftKey) {
      event.preventDefault();
      this.closeNotification(id);
    }
  }

  handleMouseDown(event: MouseEvent): void {
    if (event.shiftKey) {
      event.preventDefault();
    }
  }
}
