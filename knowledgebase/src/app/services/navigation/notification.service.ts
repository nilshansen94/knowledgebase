import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

export interface Notification {
  id: number;
  type: 'info' | 'warn' | 'error';
  title: string;
  message: string;
  duration: number; // -1 for permanent
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly notifications = new BehaviorSubject<Notification[]>([]);
  notifications$ = this.notifications.asObservable();
  private counter = 0;

  private addNotification(type: 'info' | 'warn' | 'error', title: string, message: string, duration: number): void {
    const id = ++this.counter;
    const notification: Notification = {
      id,
      type,
      title,
      message,
      duration,
      timestamp: new Date()
    };

    this.notifications.next([...this.notifications.value, notification]);

    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }
  }

  info(title: string, message: string, duration = 5000): void {
    this.addNotification('info', title, message, duration);
  }

  warn(title: string, message: string, duration = 5000): void {
    this.addNotification('warn', title, message, duration);
  }

  error(title: string, message: string, duration = 5000): void {
    this.addNotification('error', title, message, duration);
  }

  remove(id: number): void {
    const currentNotifications = this.notifications.value;
    this.notifications.next(currentNotifications.filter(n => n.id !== id));
  }

  clear(): void {
    this.notifications.next([]);
  }
}
