import { EstadoActivo } from '@/shared/types/status';

export interface Empleado {
  idEmpleado: number;
  primerNombre: string;
  primerApellido: string;
  cedula: string;
  telefono: string;
  correo: string;
  direccion: string;
  fecha_contratacion: Date;
  cargo: string;
  fecha_creacion: Date;
  fecha_ult_modificacion: null;
  activo: EstadoActivo;
  user: null;
}
