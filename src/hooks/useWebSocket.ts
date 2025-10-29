import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import { useQueryClient } from '@tanstack/react-query';

// Extraer solo el host (sin /api/v1) para WebSocket
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const SOCKET_URL = API_URL.replace('/api/v1', '');

export const useWebSocket = () => {
  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Solo conectar si el usuario está autenticado
    if (!isAuthenticated || !user?.id) {
      return;
    }

    // Crear conexión WebSocket
    const socket = io(SOCKET_URL, {
      query: {
        userId: user.id,
      },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    // Evento: Conexión exitosa
    socket.on('connect', () => {
      if (import.meta.env.DEV) {
        console.log('✅ WebSocket connected:', socket.id);
      }
    });

    // Evento: Nueva notificación
    socket.on('newNotification', (notification: any) => {
      console.log('🔔 Nueva notificación:', notification);

      // Invalidar queries de notificaciones para actualizar UI
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });

      // TODO: Mostrar toast notification
      // toast.info(notification.message);
    });

    // Evento: Contador de no leídas actualizado
    socket.on('unreadCount', (count: number) => {
      if (import.meta.env.DEV) {
        console.log('📊 Unread count updated:', count);
      }
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    });

    // Evento: Lista de notificaciones
    socket.on('notifications', (notifications: any[]) => {
      if (import.meta.env.DEV) {
        console.log('📋 Notifications received:', notifications.length);
      }
      queryClient.setQueryData(['notifications'], notifications);
    });

    // Evento: Error de conexión
    socket.on('connect_error', (error) => {
      // Solo mostrar errores que NO sean "Invalid namespace" en desarrollo
      const errorMessage = error.message || String(error);
      if (!errorMessage.includes('Invalid namespace')) {
        console.error('❌ WebSocket connection error:', error);
      }
    });

    // Evento: Desconexión
    socket.on('disconnect', (reason) => {
      // Solo mostrar desconexiones inesperadas (no las normales)
      if (reason !== 'io client disconnect' && reason !== 'io server disconnect') {
        console.log('🔌 WebSocket disconnected:', reason);
      }
    });

    // Cleanup: Desconectar cuando el componente se desmonte o el usuario cierre sesión
    return () => {
      // Silenciar cleanup logs en desarrollo (React Strict Mode)
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, user?.id, queryClient]);

  // Métodos para interactuar con el socket
  const getNotifications = () => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('getNotifications');
    }
  };

  const markAsRead = (notificationId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('markAsRead', notificationId);
    }
  };

  const markAllAsRead = () => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('markAllAsRead');
    }
  };

  return {
    socket: socketRef.current,
    isConnected: socketRef.current?.connected || false,
    getNotifications,
    markAsRead,
    markAllAsRead,
  };
};
