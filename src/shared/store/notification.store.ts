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
  tipo:
    | 'nueva_cita'
    | 'nueva_cotizacion'
    | 'existencia_bodega_minima_warning'
    | 'existencia_bodega_sin_existencias'
    | 'existencia_bodega_reorden_warning';
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
    case 'existencia_bodega_minima_warning':
      return 'warning';
    case 'existencia_bodega_sin_existencias':
      return 'error';
    case 'existencia_bodega_reorden_warning':
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
  const itemNombre =
    (_data as any)?.itemNombre || (_data as any)?.nombreItem || 'un ítem';
  const bodegaNombre =
    (_data as any)?.bodegaNombre ||
    (_data as any)?.nombreBodega ||
    'una bodega';
  const cantidadActual = (_data as any)?.cantidadActual ?? 'N/A';
  const cantidadMinima = (_data as any)?.cantidadMinima ?? 'N/A';

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
    case 'existencia_bodega_minima_warning':
      return {
        title: 'Alerta de Stock Mínimo',
        message: `${itemNombre} en ${bodegaNombre} está cerca del mínimo (${cantidadActual}/${cantidadMinima})`,
        link: idRegistro
          ? `/existencia-bodega?item=${idRegistro}`
          : '/existencia-bodega',
      };
    case 'existencia_bodega_sin_existencias':
      return {
        title: 'Sin Existencias',
        message: `${itemNombre} en ${bodegaNombre} se ha agotado (${cantidadActual} unidades)`,
        link: idRegistro
          ? `/existencia-bodega?item=${idRegistro}`
          : '/existencia-bodega',
      };
    case 'existencia_bodega_reorden_warning':
      return {
        title: 'Alerta de Reorden',
        message: `${itemNombre} en ${bodegaNombre} requiere reorden (${cantidadActual}/${cantidadMinima})`,
        link: idRegistro
          ? `/existencia-bodega?item=${idRegistro}`
          : '/existencia-bodega',
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
    // Error al guardar en localStorage - continuar de todas formas
  }
};

export const useNotificationStore = create<NotificationState>((set, get) => {
  let socketInstance: Socket | null = null;
  let audioInstance: HTMLAudioElement | null = null;

  // Cargar notificaciones iniciales desde localStorage
  const initialNotifications = loadNotificationsFromStorage();
  const initialUnreadCount = initialNotifications.filter((n) => !n.read).length;

  // Inicializar audio para sonido de notificación
  const initAudio = () => {
    if (!audioInstance) {
      audioInstance = new Audio('/sounds/notification.mp3');
      audioInstance.volume = 0.5;
      audioInstance.loop = false;
      // Pre-cargar el audio
      audioInstance.load();
    }
    return audioInstance;
  };

  // Reproducir el sonido de notificación
  const playNotificationSound = () => {
    try {
      const audio = initAudio();
      audio.currentTime = 0;
      // Solo reproducir el archivo MP3, sin fallback
      audio.play().catch(() => {
        // Si falla, simplemente no reproducir nada
        // No usar fallback para evitar sonidos duplicados
      });
    } catch (error) {
      // Si hay un error, no reproducir nada
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

      // Escuchar notificaciones del admin (namespace /admin)
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
