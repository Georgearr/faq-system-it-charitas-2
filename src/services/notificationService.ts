import { getAppAdapter } from '@/api';
import { Notification } from '@/types';

export class NotificationService {
  private get adapter() {
    return getAppAdapter();
  }

  async getNotifications(): Promise<Notification[]> {
    return this.adapter.getNotifications();
  }

  async markAsRead(notificationId: string): Promise<void> {
    return this.adapter.markNotificationRead(notificationId);
  }

  async markAllAsRead(): Promise<void> {
    return this.adapter.markAllNotificationsRead();
  }
}

export const notificationService = new NotificationService();
