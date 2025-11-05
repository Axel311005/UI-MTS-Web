import type { FacturaLinea } from '@/facturas/types/Factura.interface';
import { EstadoActivo } from '@/shared/types/status';

export type ItemTipo = 'PRODUCTO' | 'SERVICIO';

export interface ItemResponse {
  idItem: number;
  clasificacion: Clasificacion;
  unidadMedida: Clasificacion;
  codigoItem: string;
  descripcion: string;
  tipo: ItemTipo;
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
  estado?: EstadoActivo;
  facturaLineas: FacturaLinea[];
  compraLineas: CompraLinea[];
  existencias: Existencia[];
}

export interface Clasificacion {
  idClasificacion?: number;
  descripcion: string;
  activo: boolean;
  fechaCreacion: Date;
  idUnidadMedida?: number;
}

export interface CompraLinea {
  idCompraLinea?: number;
  cantidad: string;
  precioUnitario: string;
  totalLinea: string;
  idFacturaLinea?: number;
}

export interface Existencia {
  idExistenciaBodega: number;
  cantDisponible: string;
  existenciaMaxima: string;
  existenciaMinima: string;
  puntoDeReorden: string;
}
