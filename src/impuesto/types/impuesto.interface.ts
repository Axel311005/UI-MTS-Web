import { EstadoActivo } from '@/shared/types/status';

export interface Impuesto {
  idImpuesto: number;
  descripcion: string;
  porcentaje: string;
  activo: EstadoActivo;
  fechaCreacion: Date;
}

