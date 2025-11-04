import { tipoPagoApi } from '../api/tipoPago.api';
import type { TipoPago } from '../types/tipoPago.interface';

export const getTipoPagoById = async (id: number) => {
  const { data } = await tipoPagoApi.get<TipoPago>(`/${id}`);
  return data;
};

