import { EstadoActivo } from '@/shared/types/status';
export interface ExistenciaBodega {
  idExistenciaBodega: number;
  item: Item;
  bodega: Bodega;
  cantDisponible: string;
  existenciaMaxima: string;
  existenciaMinima: string;
  puntoDeReorden: string;
}

export interface Bodega {
  idBodega: number;
  descripcion: string;
  activo: EstadoActivo;
  fechaCreacion: Date;
}

export interface Item {
  idItem: number;
  codigoItem: string;
  descripcion: string;
  tipo: string;
  precioBaseLocal: string;
  precioBaseDolar: string;
  precioAdquisicionLocal: string;
  precioAdquisicionDolar: string;
  esCotizable: boolean;
  ultimaSalida: Date;
  ultimoIngreso: Date;
  usuarioUltModif: string;
  fechaUltModif: Date;
  perecedero: boolean;
  fechaCreacion: Date;
  activo: EstadoActivo;
}
