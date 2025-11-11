import { EstadoActivo } from '@/shared/types/status';

export interface Consecutivo {
  idConsecutivo: number;
  descripcion: string;
  activo: EstadoActivo;
  longitud: number;
  documento: string;
  mascara: string;
  valorInicial: number;
  valorFinal: number;
  ultimoValor: number;
  fechaCreacion: Date;
  fechaUlt: Date;
}
