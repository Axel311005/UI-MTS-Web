import { useEffect, useRef } from 'react';
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
  const prevAuthStatusRef = useRef(authStatus);
  const prevTokenRef = useRef(token);

  // Conectar cuando el usuario esté autenticado
  useEffect(() => {
    const authChanged = prevAuthStatusRef.current !== authStatus;
    const tokenChanged = prevTokenRef.current !== token;

    if (authChanged || tokenChanged) {
      prevAuthStatusRef.current = authStatus;
      prevTokenRef.current = token;

      if (authStatus === 'authenticated' && token) {
        console.log('[Notifications] Conectando WebSocket...', {
          authStatus,
          hasToken: !!token,
        });
        connect();
      } else {
        console.log('[Notifications] Desconectando WebSocket...', {
          authStatus,
          hasToken: !!token,
        });
        disconnect();
      }
    }

    // Cleanup al desmontar
    return () => {
      if (authStatus !== 'authenticated') {
        disconnect();
      }
    };
  }, [authStatus, token]);

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
