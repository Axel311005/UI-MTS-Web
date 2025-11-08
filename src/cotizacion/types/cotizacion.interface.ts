import type { CotizacionEstado } from '@/shared/types/status';
import type { Cliente } from '@/clientes/types/cliente.interface';
import type { Consecutivo } from '@/consecutivo/types/consecutivo.response';
import type { DetalleCotizacion } from './detalle-cotizacion.interface';

export interface Cotizacion {
  idCotizacion: number;
  cliente: Cliente;
  consecutivo: Consecutivo;
  codigoCotizacion: string;
  fecha: string | Date;
  estado: CotizacionEstado;
  total: string;
  nombreCliente: string;
  detalles?: DetalleCotizacion[];
}

export interface CreateCotizacionPayload {
  idCliente: number;
  idConsecutivo: number;
  estado: CotizacionEstado;
  nombreCliente?: string;
}

export interface UpdateCotizacionPayload {
  idCliente?: number;
  idConsecutivo?: number;
  estado?: CotizacionEstado;
  nombreCliente?: string;
}

