export interface Bodega {
  idBodega: number;
  descripcion: string;
  activo: EstadoActivo; // Enum desde backend
  fechaCreacion: string; // ISO string desde API
}
export type EstadoActivo = 'ACTIVO' | 'INACTIVO';
