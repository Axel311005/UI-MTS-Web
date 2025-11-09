// Configuración para conectar al namespace admin en NestJS
// Gateway: @WebSocketGateway({ namespace: '/admin' })

// URL base del servidor (sin namespace)
export const SOCKET_BASE_URL =
  import.meta.env.VITE_SOCKET_URL?.replace(/\/admin$/, '') ??
  import.meta.env.VITE_API_URL ??
  'http://localhost:3000';

// Namespace para admin
export const SOCKET_NAMESPACE = '/admin';

// Namespace para cliente
export const SOCKET_NAMESPACE_CLIENTE = '/cliente';

// URL completa para Socket.IO (Socket.IO maneja el namespace automáticamente)
export const SOCKET_URL = `${SOCKET_BASE_URL}${SOCKET_NAMESPACE}`;

// URL completa para Socket.IO del namespace cliente
export const SOCKET_URL_CLIENTE = `${SOCKET_BASE_URL}${SOCKET_NAMESPACE_CLIENTE}`;

// URL base del API (usar para POST de prueba u otros endpoints HTTP)
export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

// Cliente ID opcional: cuando el cliente representa a un cliente final
// El gateway de servidor extrae `clienteId` desde client.handshake.query
export const CLIENTE_ID = import.meta.env.VITE_CLIENTE_ID ?? '';

