import type { RecepcionEstado } from '@/shared/types/status';
import type { Vehiculo } from '@/vehiculo/types/vehiculo.interface';

export interface Recepcion {
  idRecepcion: number;
  vehiculo: Vehiculo;
  empleado: Empleado;
  fechaRecepcion: Date;
  observaciones: string;
  estado: RecepcionEstado;
  codigoRecepcion: string;
  fechaEntregaEstimada: Date;
  fechaEntregaReal: Date;
}

export interface Empleado {
  idEmpleado: number;
  primerNombre: string;
  primerApellido: string;
  cedula: string;
  telefono: string;
  direccion: string;
  fecha_contratacion: Date;
  fecha_creacion: Date;
  fecha_ult_modificacion: null;
  activo: string;
}
