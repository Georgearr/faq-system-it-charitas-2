import { create } from 'zustand';
import { Notification } from '@/types';
import { notificationService } from '@/services/notificationService';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;

  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    try {
      set({ isLoading: true });
      const list = await notificationService.getNotifications();
      const unread = list.filter((n) => !n.readAt).length;
      set({ notifications: list, unreadCount: unread, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  markAsRead: async (id: string) => {
    await notificationService.markAsRead(id);
    const updated = get().notifications.map((n) =>
      n.notificationId === id ? { ...n, readAt: new Date().toISOString() } : n
    );
    set({
      notifications: updated,
      unreadCount: updated.filter((n) => !n.readAt).length,
    });
  },

  markAllAsRead: async () => {
    await notificationService.markAllAsRead();
    const updated = get().notifications.map((n) => ({
      ...n,
      readAt: n.readAt || new Date().toISOString(),
    }));
    set({ notifications: updated, unreadCount: 0 });
  },
}));
