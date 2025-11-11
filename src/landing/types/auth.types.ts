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
  token: string;
  user: {
    id: number;
    email: string;
    cliente?: {
      idCliente: number;
      primerNombre: string;
      primerApellido: string;
    };
    empleado?: {
      idEmpleado: number;
      primerNombre: string;
      primerApellido: string;
    };
  };
}
