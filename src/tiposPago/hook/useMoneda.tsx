import { useQuery } from '@tanstack/react-query';
import { getTipoPagosAction } from '../actions/get-tipo-pago';

import type { TipoPago } from '../types/tipoPago.interface';

export const useTipoPago = () => {
  const query = useQuery<TipoPago[]>({
    queryKey: ['tipoPagos'],
    queryFn: getTipoPagosAction,
    staleTime: 1000 * 60 * 10,
  });
  return {
    tipoPagos: query.data,
  };
};
