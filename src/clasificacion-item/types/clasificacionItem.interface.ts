import { EstadoActivo } from '@/shared/types/status';

export interface ClasificacionItem {
  idClasificacion: number;
  descripcion: string;
  activo: EstadoActivo;
  fechaCreacion: Date;
}
