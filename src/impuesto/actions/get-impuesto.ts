import { tipoPagoApi } from '../api/tipoPago.api';
import type { Impuesto } from '../types/impuesto.response';

export const getImpuestoAction = async () => {
  const { data: impuestos } = await tipoPagoApi.get<Impuesto[]>('/');

  return impuestos;
};
