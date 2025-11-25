import { EstadoActivo } from '@/shared/types/status';

export type ItemTipo = 'PRODUCTO' | 'SERVICIO';

export interface ItemFormValues {
  clasificacionId: number | '';
  unidadMedidaId: number | '';
  codigoItem: string;
  codigoCategoria: string; // Código de categoría con guion (ej: "MTR-")
  codigoConsecutivo: string; // Número consecutivo (ej: "1", "50")
  descripcion: string;
  tipo: ItemTipo;
  precioBaseLocal: string;
  precioBaseDolar: string;
  precioAdquisicionLocal: string;
  precioAdquisicionDolar: string;
  esCotizable: boolean;
  ultimaSalida: string;
  ultimoIngreso: string;
  usuarioUltModif: string;
  fechaUltModif: string;
  perecedero: boolean;
  activo: EstadoActivo;
}

export interface ItemFormErrors {
  [key: string]: string | undefined;
}

export const INITIAL_ITEM_FORM_VALUES: ItemFormValues = {
  clasificacionId: '',
  unidadMedidaId: '',
  codigoItem: '',
  codigoCategoria: '',
  codigoConsecutivo: '',
  descripcion: '',
  tipo: 'PRODUCTO',
  precioBaseLocal: '',
  precioBaseDolar: '',
  precioAdquisicionLocal: '',
  precioAdquisicionDolar: '',
  esCotizable: false,
  ultimaSalida: '',
  ultimoIngreso: '',
  usuarioUltModif: '',
  fechaUltModif: '',
  perecedero: false,
  activo: EstadoActivo.ACTIVO,
};

export function toNumberOrZero(val: string | number | undefined): number {
  const n = Number(val);
  return Number.isFinite(n) ? n : 0;
}
