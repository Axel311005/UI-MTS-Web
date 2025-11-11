import type { Cliente } from '@/clientes/types/cliente.interface';

// Extender el tipo Cliente para incluir campos opcionales que pueden venir del backend
export interface ClienteAuth extends Omit<Cliente, 'idCliente'> {
  id?: number; // Algunos endpoints pueden devolver id en lugar de idCliente
  idCliente: number;
  nombreCompleto?: string; // Campo opcional que puede venir del backend
}

export interface AuthResponse {
  id: string;
  email: string;
  roles: string[];
  empleado: Empleado;
  cliente: ClienteAuth;
  token: string;
  isActive?: boolean; // Campo del backend para verificar si el usuario está activo
}

export interface Empleado {
  id: number;
  primerNombre: string | null;
  primerApellido: string | null;
  nombreCompleto?: string; // Campo opcional para compatibilidad con backend que puede devolverlo
}
