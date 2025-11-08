// Configuración para conectar al namespace admin en NestJS
// Gateway: @WebSocketGateway({ namespace: '/admin' })

export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:3000/admin';

// URL base del API (usar para POST de prueba u otros endpoints HTTP)
export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

// Cliente ID opcional: cuando el cliente representa a un cliente final
// El gateway de servidor extrae `clienteId` desde client.handshake.query
export const CLIENTE_ID = import.meta.env.VITE_CLIENTE_ID ?? '';

