import type { Cliente } from '@/clientes/types/cliente.interface';

export interface AuthResponse {
  id: string;
  email: string;
  roles: string[];
  empleado: Empleado;
  cliente: Cliente;
  token: string;
  isActive?: boolean; // Campo del backend para verificar si el usuario está activo
}

export interface Empleado {
  id: number;
  primerNombre: string | null;
  primerApellido: string | null;
  nombreCompleto?: string; // Campo opcional para compatibilidad con backend que puede devolverlo
}
