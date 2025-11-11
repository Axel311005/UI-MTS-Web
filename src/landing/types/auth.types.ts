export interface RegisterPayload {
  email: string;
  password: string;
  clienteId?: number;
  empleadoId?: number;
  clienteData?: {
    primerNombre: string;
    primerApellido: string;
    ruc: string | null;
    direccion: string;
    telefono: string;
    notas?: string;
  };
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  id: string; // UUID del usuario
  email: string;
  roles: string[];
  token: string;
  isActive?: boolean;
  loginAttempts?: number;
  blockedUntil?: string | null;
  cliente?: {
    id?: number; // Algunos endpoints pueden devolver id en lugar de idCliente
    idCliente: number;
    primerNombre: string;
    primerApellido: string;
    ruc?: string | null;
    direccion?: string;
    telefono?: string;
    esExonerado?: boolean;
    porcentajeExonerado?: string;
    activo?: string;
    notas?: string;
    fechaUltModif?: string | null;
    fechaCreacion?: string;
    nombreCompleto?: string; // Campo opcional que puede venir del backend
  };
  empleado?: {
    idEmpleado: number;
    primerNombre: string;
    primerApellido: string;
    nombreCompleto?: string; // Campo opcional que puede venir del backend
  };
}
