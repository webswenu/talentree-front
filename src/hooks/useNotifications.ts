import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import { notificationsService } from '../services/notifications.service';
import { Notification } from '../types/notification.types';
import { useAuthStore } from '../store/authStore';

export const notificationKeys = {
  all: ['notifications'] as const,
  my: () => [...notificationKeys.all, 'my'] as const,
  unread: () => [...notificationKeys.all, 'unread'] as const,
  unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
};

let socket: Socket | null = null;

export const useNotifications = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [newNotification, setNewNotification] = useState<Notification | null>(null);

  useEffect(() => {
    if (user && !socket) {
      // Connect to WebSocket
      socket = io('http://localhost:3002', {
        query: { userId: user.id },
      });

      socket.on('connect', () => {
        console.log('WebSocket connected');
      });

      socket.on('newNotification', (notification: Notification) => {
        setNewNotification(notification);
        queryClient.invalidateQueries({ queryKey: notificationKeys.my() });
        queryClient.invalidateQueries({ queryKey: notificationKeys.unread() });
        queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
      });

      socket.on('disconnect', () => {
        console.log('WebSocket disconnected');
      });
    }

    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    };
  }, [user, queryClient]);

  const query = useQuery({
    queryKey: notificationKeys.my(),
    queryFn: () => notificationsService.getMyNotifications(),
    enabled: !!user,
  });

  return {
    ...query,
    newNotification,
    clearNewNotification: () => setNewNotification(null),
  };
};

export const useUnreadNotifications = () => {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: notificationKeys.unread(),
    queryFn: () => notificationsService.getUnread(),
    enabled: !!user,
  });
};

export const useUnreadCount = () => {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => notificationsService.getUnreadCount(),
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.my() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unread() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.my() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unread() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.my() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unread() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
    },
  });
};
