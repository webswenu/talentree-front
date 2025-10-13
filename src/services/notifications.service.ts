import { apiService } from './api.service';
import type { Notification } from '../types/notification.types';

class NotificationsService {
  private basePath = '/notifications';

  async getMyNotifications(): Promise<Notification[]> {
    const response = await apiService.get<Notification[]>(`${this.basePath}/my-notifications`);
    return response.data;
  }

  async getAll(): Promise<Notification[]> {
    return this.getMyNotifications();
  }

  async getUnread(): Promise<Notification[]> {
    const response = await apiService.get<Notification[]>(`${this.basePath}/unread`);
    return response.data;
  }

  async getUnreadCount(): Promise<number> {
    const response = await apiService.get<number>(`${this.basePath}/unread-count`);
    return response.data;
  }

  async markAsRead(id: string): Promise<Notification> {
    const response = await apiService.patch<Notification>(`${this.basePath}/${id}/read`);
    return response.data;
  }

  async markAllAsRead(): Promise<void> {
    await apiService.patch(`${this.basePath}/mark-all-read`);
  }

  async delete(id: string): Promise<void> {
    await apiService.delete(`${this.basePath}/${id}`);
  }
}

export const notificationsService = new NotificationsService();
