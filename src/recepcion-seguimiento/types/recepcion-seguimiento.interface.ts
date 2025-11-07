import type { RecepcionSeguimientoEstado } from '@/shared/types/status';

export interface RecepcionSeguimiento {
  idRecepcionSeguimiento: number;
  recepcion: RecepcionInfo;
  fecha: Date;
  estado: RecepcionSeguimientoEstado;
  descripcion: string;
}

export interface RecepcionInfo {
  idRecepcion: number;
  fechaRecepcion: Date;
  observaciones: string;
  estado: string;
  codigoRecepcion: string;
  fechaEntregaEstimada: Date;
  fechaEntregaReal: Date;
}

