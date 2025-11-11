import { EstadoActivo } from '@/shared/types/status';

export interface TipoPago {
  idTipoPago: number;
  descripcion: string;
  activo: EstadoActivo;
  fechaCreacion: Date;
}
