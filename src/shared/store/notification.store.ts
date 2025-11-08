import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../config/socket.config';
import { useAuthStore } from '@/auth/store/auth.store';
import type {
  Notification,
  NotificationType,
} from '../components/layouts/NotificationCenter';

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
  _data: AdminNotification['data'],
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

// Clave para localStorage
const NOTIFICATIONS_STORAGE_KEY = 'mts_notifications';

// Cargar notificaciones desde localStorage
const loadNotificationsFromStorage = (): Notification[] => {
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    // Convertir timestamps de string a Date
    return parsed.map((n: any) => ({
      ...n,
      timestamp: new Date(n.timestamp),
    }));
  } catch (error) {
    console.warn('Error al cargar notificaciones desde localStorage:', error);
    return [];
  }
};

// Guardar notificaciones en localStorage
const saveNotificationsToStorage = (notifications: Notification[]) => {
  try {
    localStorage.setItem(
      NOTIFICATIONS_STORAGE_KEY,
      JSON.stringify(notifications)
    );
  } catch (error) {
    console.warn('Error al guardar notificaciones en localStorage:', error);
  }
};

export const useNotificationStore = create<NotificationState>((set, get) => {
  let socketInstance: Socket | null = null;

  // Cargar notificaciones iniciales desde localStorage
  const initialNotifications = loadNotificationsFromStorage();
  const initialUnreadCount = initialNotifications.filter((n) => !n.read).length;

  // Reproducir un beep usando Web Audio API
  const playNotificationSound = async () => {
    try {
      // Crear contexto de audio (puede requerir interacción del usuario primero)
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        return; // El navegador no soporta Web Audio API
      }

      const audioContext = new AudioContextClass();

      // Si el contexto está suspendido (requiere interacción del usuario), intentar reanudarlo
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Configurar el sonido: frecuencia 800Hz, tipo sine
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      // Configurar el volumen: empieza en 0.3 y baja exponencialmente
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.2
      );

      // Reproducir el sonido por 200ms
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);

      // Limpiar el contexto después de que termine el sonido
      oscillator.onended = () => {
        audioContext.close().catch(() => {
          // Ignorar errores al cerrar el contexto
        });
      };
    } catch (error) {
      // Silenciar errores si el navegador no soporta Web Audio API o hay problemas de permisos
    }
  };

  return {
    // Estado inicial (cargado desde localStorage)
    socket: null,
    connected: false,
    socketId: null,
    connectionError: null,
    notifications: initialNotifications,
    unreadCount: initialUnreadCount,

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
        set({
          connected: true,
          socketId: socket.id ?? null,
          connectionError: null,
          socket: socket,
        });
      });

      socket.on('disconnect', () => {
        set({
          connected: false,
          socketId: null,
        });
      });

      socket.on('connect_error', (error) => {
        const errorMessage = error?.message ?? String(error);
        set({ connectionError: errorMessage, connected: false });
      });

      // Escuchar notificaciones del admin
      socket.on('adminNotification', (payload: AdminNotification) => {
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
        // Guardar en localStorage
        saveNotificationsToStorage(updated);
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
        // Guardar en localStorage
        saveNotificationsToStorage(updated);
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
        // Guardar en localStorage
        saveNotificationsToStorage(updated);
        return {
          notifications: updated,
          unreadCount: 0,
        };
      });
    },

    // Limpiar todas
    clearAll: () => {
      const empty: Notification[] = [];
      // Limpiar localStorage
      saveNotificationsToStorage(empty);
      set({
        notifications: empty,
        unreadCount: 0,
      });
    },

    // Eliminar notificación
    removeNotification: (id) => {
      set((state) => {
        const updated = state.notifications.filter((n) => n.id !== id);
        // Guardar en localStorage
        saveNotificationsToStorage(updated);
        return {
          notifications: updated,
          unreadCount: updated.filter((n) => !n.read).length,
        };
      });
    },
  };
});
