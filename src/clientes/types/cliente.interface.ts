import { EstadoActivo } from '@/shared/types/status';

export interface Cliente {
  idCliente: number;
  nombre: string;
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
