import { EstadoActivo } from '@/shared/types/status';

export interface ClienteFormValues {
  nombre: string;
  ruc: string;
  direccion: string;
  telefono: string;
  esExonerado: boolean;
  porcentajeExonerado: string;
  activo: EstadoActivo;
  notas: string;
}

export type ClienteFormErrors = Partial<
  Record<keyof ClienteFormValues, string>
>;

export const INITIAL_CLIENTE_FORM_VALUES: ClienteFormValues = {
  nombre: '',
  ruc: '',
  direccion: '',
  telefono: '',
  esExonerado: false,
  porcentajeExonerado: '0',
  activo: EstadoActivo.ACTIVO,
  notas: '',
};

export const toNumberOrZero = (value: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};
