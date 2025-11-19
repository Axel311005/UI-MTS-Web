import type { Cliente } from '@/clientes/types/cliente.interface';

// Extender el tipo Cliente para incluir campos opcionales que pueden venir del backend
export interface ClienteAuth extends Omit<Cliente, 'idCliente'> {
  id?: number; // Algunos endpoints pueden devolver id en lugar de idCliente
  idCliente: number;
  nombreCompleto?: string; // Campo opcional que puede venir del backend
}

export interface Empleado {
  id: number;
  primerNombre: string | null;
  primerApellido: string | null;
  nombreCompleto?: string; // Campo opcional para compatibilidad con backend que puede devolverlo
}

/**
 * Respuesta completa de autenticación (login)
 * Incluye todos los datos del usuario, empleado, cliente, etc.
 */
export interface AuthResponse {
  id: string;
  email: string;
  roles: string[];
  empleado: Empleado;
  cliente: ClienteAuth;
  token: string;
  isActive?: boolean; // Campo del backend para verificar si el usuario está activo
}

/**
 * Respuesta de check-status
 * Es más simple que AuthResponse y solo incluye información básica del usuario
 */
export interface CheckStatusResponse {
  id: string;
  email: string;
  isActive: boolean;
  loginAttempts: number;
  blockedUntil: string | null;
  roles: string[];
  token: string;
  // Campos opcionales que pueden venir en algunas respuestas
  empleado?: Empleado;
  cliente?: ClienteAuth;
}
