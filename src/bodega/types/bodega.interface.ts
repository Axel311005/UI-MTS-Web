import { EstadoActivo } from '@/shared/types/status';

export interface Bodega {
  idBodega: number;
  descripcion: string;
  activo: EstadoActivo; // Enum desde backend
  fechaCreacion: string; // ISO string desde API
}
