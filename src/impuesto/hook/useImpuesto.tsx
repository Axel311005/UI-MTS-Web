import { useQuery } from '@tanstack/react-query';
import { getImpuestoAction } from '../actions/get-impuesto';

import type { Impuesto } from '../types/impuesto.response';

export const useImpuesto = () => {
  const query = useQuery<Impuesto[]>({
    queryKey: ['impuestos'],
    queryFn: getImpuestoAction,
    staleTime: 1000 * 60 * 10,
  });
  return {
    impuestos: query.data,
  };
};
