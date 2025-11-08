import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../config/socket.config';
import { useAuthStore } from '@/auth/store/auth.store';
import type { Notification, NotificationType } from '../components/layouts/NotificationCenter';

// Tipos de notificaciones que vienen del backend
interface AdminNotification {
  tipo: 'nueva_cita' | 'nueva_cotizacion' | 'recepcion_seguimiento_actualizado';
  id_registro: number | string;
  nombre_cliente?: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

interface NotificationState {
  // Estado del socket
  socket: Socket | null;
  connected: boolean;
  socketId: string | null;
  connectionError: string | null;

  // Notificaciones
  notifications: Notification[];
  unreadCount: number;

  // Acciones del socket
  connect: () => void;
  disconnect: () => void;

  // Acciones de notificaciones
  addNotification: (
    notification: Omit<Notification, 'id' | 'timestamp' | 'read'>
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  removeNotification: (id: string) => void;
}

// Mapear tipos del backend a tipos del frontend
const mapNotificationType = (
  tipo: AdminNotification['tipo']
): NotificationType => {
  switch (tipo) {
    case 'nueva_cita':
      return 'info';
    case 'nueva_cotizacion':
      return 'success';
    case 'recepcion_seguimiento_actualizado':
      return 'warning';
    default:
      return 'info';
  }
};

// Mapear tipos del backend a títulos y mensajes
const mapNotificationContent = (
  tipo: AdminNotification['tipo'],
  idRegistro: number | string,
  data: AdminNotification['data'],
  nombreCliente?: string
): { title: string; message: string; link?: string } => {
  const cliente = nombreCliente || 'Cliente';
  
  switch (tipo) {
    case 'nueva_cita':
      return {
        title: 'Nueva Cita',
        message: `${cliente} ha agendado una nueva cita`,
        link: idRegistro ? `/citas/${idRegistro}` : '/citas',
      };
    case 'nueva_cotizacion':
      return {
        title: 'Nueva Cotización',
        message: `Se ha generado una nueva cotización para ${cliente}`,
        link: idRegistro ? `/cotizaciones/${idRegistro}` : '/cotizaciones',
      };
    case 'recepcion_seguimiento_actualizado':
      return {
        title: 'Seguimiento Actualizado',
        message: `Se ha actualizado el seguimiento de recepción para ${cliente}`,
        link: idRegistro ? `/recepciones/${idRegistro}` : '/recepciones',
      };
    default:
      return {
        title: 'Nueva Notificación',
        message: 'Tienes una nueva notificación',
      };
  }
};

export const useNotificationStore = create<NotificationState>((set, get) => {
  let socketInstance: Socket | null = null;
  let audioInstance: HTMLAudioElement | null = null;

  // Inicializar audio para sonido de notificación
  const initAudio = () => {
    if (!audioInstance) {
      audioInstance = new Audio('/sounds/notification.mp3');
      audioInstance.volume = 0.5;
    }
    return audioInstance;
  };

  const playNotificationSound = () => {
    try {
      const audio = initAudio();
      audio.currentTime = 0;
      audio.play().catch((error) => {
        console.warn('No se pudo reproducir el sonido de notificación:', error);
      });
    } catch (error) {
      console.warn('Error al inicializar audio:', error);
    }
  };

  return {
    // Estado inicial
    socket: null,
    connected: false,
    socketId: null,
    connectionError: null,
    notifications: [],
    unreadCount: 0,

    // Conectar socket
    connect: () => {
      // Si ya hay una conexión, no crear otra
      if (socketInstance?.connected) {
        return;
      }

      // Si hay una instancia desconectada, limpiarla
      if (socketInstance) {
        socketInstance.disconnect();
        socketInstance.removeAllListeners();
      }

      // Obtener token del auth store
      const token = useAuthStore.getState().token;
      const authToken = token || localStorage.getItem('token');

      // Crear nueva conexión
      const socket = io(SOCKET_URL, {
        auth: authToken ? { token: authToken } : undefined,
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      socketInstance = socket;

      // Event listeners
      socket.on('connect', () => {
        console.info('[Socket] Conectado:', socket.id);
        set({
          connected: true,
          socketId: socket.id ?? null,
          connectionError: null,
          socket: socket,
        });
      });

      socket.on('disconnect', (reason) => {
        console.warn('[Socket] Desconectado:', reason);
        set({
          connected: false,
          socketId: null,
        });
      });

      socket.on('connect_error', (error) => {
        const errorMessage = error?.message ?? String(error);
        console.error('[Socket] Error de conexión:', errorMessage);
        set({ connectionError: errorMessage, connected: false });
      });

      // Escuchar notificaciones del admin
      socket.on('adminNotification', (payload: AdminNotification) => {
        console.info('[Socket] Notificación recibida:', payload);

        const { title, message, link } = mapNotificationContent(
          payload.tipo,
          payload.id_registro,
          payload.data,
          payload.nombre_cliente
        );

        get().addNotification({
          type: mapNotificationType(payload.tipo),
          title,
          message,
          link,
        });
      });

      // Escuchar notificaciones de cliente (si se usa namespace /cliente)
      socket.on('clienteNotification', (payload: AdminNotification) => {
        console.info('[Socket] Notificación de cliente recibida:', payload);

        const { title, message, link } = mapNotificationContent(
          payload.tipo,
          payload.id_registro,
          payload.data,
          payload.nombre_cliente
        );

        get().addNotification({
          type: mapNotificationType(payload.tipo),
          title,
          message,
          link,
        });
      });

      set({ socket });
    },

    // Desconectar socket
    disconnect: () => {
      if (socketInstance) {
        socketInstance.disconnect();
        socketInstance.removeAllListeners();
        socketInstance = null;
      }
      set({
        socket: null,
        connected: false,
        socketId: null,
        connectionError: null,
      });
    },

    // Agregar notificación
    addNotification: (notification) => {
      const newNotification: Notification = {
        ...notification,
        id: `notification-${Date.now()}-${Math.random()}`,
        timestamp: new Date(),
        read: false,
      };

      set((state) => {
        const updated = [newNotification, ...state.notifications].slice(0, 50); // Mantener solo las últimas 50
        return {
          notifications: updated,
          unreadCount: updated.filter((n) => !n.read).length,
        };
      });

      // Reproducir sonido
      playNotificationSound();
    },

    // Marcar como leída
    markAsRead: (id) => {
      set((state) => {
        const updated = state.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        );
        return {
          notifications: updated,
          unreadCount: updated.filter((n) => !n.read).length,
        };
      });
    },

    // Marcar todas como leídas
    markAllAsRead: () => {
      set((state) => {
        const updated = state.notifications.map((n) => ({ ...n, read: true }));
        return {
          notifications: updated,
          unreadCount: 0,
        };
      });
    },

    // Limpiar todas
    clearAll: () => {
      set({
        notifications: [],
        unreadCount: 0,
      });
    },

    // Eliminar notificación
    removeNotification: (id) => {
      set((state) => {
        const updated = state.notifications.filter((n) => n.id !== id);
        return {
          notifications: updated,
          unreadCount: updated.filter((n) => !n.read).length,
        };
      });
    },
  };
});

