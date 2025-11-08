import type { ItemResponse } from '@/items/types/item.response';
import type { Cotizacion } from './cotizacion.interface';

export interface DetalleCotizacion {
  idDetalleCotizacion: number;
  item: ItemResponse;
  cotizacion: Cotizacion;
  cantidad: string;
  precioUnitario: string;
  totalLineas: string;
}

export interface CreateDetalleCotizacionPayload {
  idItem: number;
  idCotizacion: number;
  cantidad: number;
  precioUnitario: number;
  totalLineas: number;
}

export interface UpdateDetalleCotizacionPayload {
  idItem?: number;
  idCotizacion?: number;
  cantidad?: number;
  precioUnitario?: number;
  totalLineas?: number;
}

