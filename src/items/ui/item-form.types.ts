export interface ItemFormValues {
  clasificacionId: number | '';
  unidadMedidaId: number | '';
  codigoItem: string;
  descripcion: string;
  tipo: string;
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
  activo: boolean;
}

export interface ItemFormErrors {
  [key: string]: string | undefined;
}

export const INITIAL_ITEM_FORM_VALUES: ItemFormValues = {
  clasificacionId: '',
  unidadMedidaId: '',
  codigoItem: '',
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
  activo: true,
};

export function toNumberOrZero(val: string | number | undefined): number {
  const n = Number(val);
  return Number.isFinite(n) ? n : 0;
}
