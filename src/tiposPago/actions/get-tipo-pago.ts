import { tipoPagoApi } from '../api/tipoPago.api';
import type { TipoPago } from '../types/tipoPago.interface';

export const getTipoPagosAction = async () => {
  const { data: tipoPagos } = await tipoPagoApi.get<TipoPago[]>('/');

  return tipoPagos;
};
