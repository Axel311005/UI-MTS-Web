import { EstadoActivo } from '@/shared/types/status';

export interface UnidadMedida {
  idUnidadMedida: number;
  descripcion: string;
  fechaCreacion: Date;
  activo: EstadoActivo;
}
