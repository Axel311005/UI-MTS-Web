import {
  landingCotizacionApi,
  landingItemApi,
  landingDetalleCotizacionApi,
} from '../api/landing.api';
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
): Promise<{ idCotizacion: number; codigoCotizacion?: string }> => {
  const { data } = await landingCotizacionApi.post<{
    idCotizacion: number;
    codigoCotizacion?: string;
  }>('/', payload);
  return data;
};

export const createDetalleCotizacion = async (
  payload: CreateDetalleCotizacionPayload
): Promise<{ idDetalleCotizacion: number }> => {
  const { data } = await landingDetalleCotizacionApi.post<{
    idDetalleCotizacion: number;
  }>('/', payload);
  return data;
};

export const getCotizacionPdf = async (idCotizacion: number): Promise<Blob> => {
  const response = await landingCotizacionApi.get(
    `/${idCotizacion}/cotizacion-pdf`,
    {
      responseType: 'blob',
    }
  );
  // response.data ya es un Blob cuando responseType es 'blob'
  return response.data;
};
