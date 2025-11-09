import { landingCotizacionApi, landingItemApi, landingDetalleCotizacionApi } from '../api/landing.api';
import type {
  ItemCotizable,
  CreateCotizacionPayload,
  CreateDetalleCotizacionPayload,
} from '../types/cotizacion.types';

export const getItemsCotizables = async (): Promise<ItemCotizable[]> => {
  const { data } = await landingItemApi.get<ItemCotizable[]>('/cotizables');
  return data;
};

export const createCotizacion = async (
  payload: CreateCotizacionPayload
): Promise<{ idCotizacion: number }> => {
  const { data } = await landingCotizacionApi.post<{ idCotizacion: number }>('/', payload);
  return data;
};

export const createDetalleCotizacion = async (
  payload: CreateDetalleCotizacionPayload
): Promise<{ idDetalleCotizacion: number }> => {
  const { data } = await landingDetalleCotizacionApi.post<{ idDetalleCotizacion: number }>(
    '/',
    payload
  );
  return data;
};

