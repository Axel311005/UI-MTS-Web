import { tipoPagoApi } from '../api/tipoPago.api';
import type { TipoPago } from '../types/tipoPago.interface';

export const getTipoPagosAction = async () => {
  const { data } = await tipoPagoApi.get<TipoPago[]>('/');
  const items = Array.isArray(data) ? data : [];
  return items.filter((item) => (item?.activo ?? false) === true);
};
