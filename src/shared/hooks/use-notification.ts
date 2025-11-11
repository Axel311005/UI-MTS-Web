import { useEffect } from 'react';
import { useNotificationStore } from '../store/notification.store';
import { useAuthStore } from '@/auth/store/auth.store';

/**
 * Hook para usar notificaciones con Socket.IO
 * Se conecta automáticamente cuando el usuario está autenticado
 */
export const useNotifications = () => {
  const {
    notifications,
    unreadCount,
    connected,
    connectionError,
    connect,
    disconnect,
    markAsRead,
    markAllAsRead,
    clearAll,
    addNotification,
    removeNotification,
  } = useNotificationStore();

  const { authStatus, token } = useAuthStore();

  // Conectar cuando el usuario esté autenticado
  useEffect(() => {
    if (authStatus === 'authenticated' && token) {
      connect();
    } else {
      disconnect();
    }

    // Cleanup al desmontar o cambiar estado de autenticación
    return () => {
      if (authStatus !== 'authenticated') {
        disconnect();
      }
    };
  }, [authStatus, token, connect, disconnect]);

  return {
    notifications,
    unreadCount,
    connected,
    connectionError,
    markAsRead,
    markAllAsRead,
    clearAll,
    addNotification, // Para notificaciones manuales si es necesario
    removeNotification,
  };
};
