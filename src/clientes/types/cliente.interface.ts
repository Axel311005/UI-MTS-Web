import { EstadoActivo } from '@/shared/types/status';

export interface Cliente {
  idCliente: number;
  primerNombre: string | null;
  primerApellido: string | null;
  ruc: string;
  esExonerado: boolean;
  porcentajeExonerado: string;
  direccion: string;
  telefono: string;
  activo: EstadoActivo;
  notas: string;
  fechaUltModif: null;
  fechaCreacion: Date;
}
