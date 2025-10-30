import { useQuery } from '@tanstack/react-query';
import { getComprasAction } from '../actions/get-compras';
import type { Compra } from '../types/Compra.interface';

export const useCompra = () => {
  const query = useQuery<Compra[]>({
    queryKey: ['compras'],
    queryFn: getComprasAction,
    staleTime: 1000 * 60 * 5,
  });
  return {
    compras: query.data ?? [],
  };
};
