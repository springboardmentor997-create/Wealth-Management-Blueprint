import { apiClient as api } from './api';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: string;
  created_at: string;
}

export const notificationService = {
  getNotifications: async (): Promise<Notification[]> => {
    return await api.get<Notification[]>('/api/notifications/');
  },
  
  markAsRead: async (id: string): Promise<Notification> => {
    return await api.put<Notification>(`/api/notifications/${id}/read`);
  }
};
