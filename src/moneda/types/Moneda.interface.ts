import { EstadoActivo } from '@/shared/types/status';

export interface Moneda {
  idMoneda: number;
  descripcion: string;
  tipoCambio: string;
  activo: EstadoActivo;
  fechaCreacion: Date;
}
