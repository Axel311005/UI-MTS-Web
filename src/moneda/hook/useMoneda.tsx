import { useQuery } from '@tanstack/react-query';
import { getMonedasAction } from '../actions/get-moneda';

import type { Moneda } from '../types/Moneda.interface';

export const useMoneda = () => {
  const query = useQuery<Moneda[]>({
    queryKey: ['monedas'],
    queryFn: getMonedasAction,
    staleTime: 1000 * 60 * 10,
  });
  return {
    monedas: query.data,
  };
};
