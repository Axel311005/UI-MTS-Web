import { useQuery } from '@tanstack/react-query';
import type { ClasificacionItem } from '../types/clasificacionItem.interface';
import { getClasificacionItemsAction } from '../actions/get-clasificacion-item';

export const useClasificacionItem = () => {
  const query = useQuery<ClasificacionItem[]>({
    queryKey: ['clasificacionItems'],
    queryFn: getClasificacionItemsAction,
    staleTime: 1000 * 60 * 5,
  });
  return {
    clasificacionItems: query.data ?? [],
  };
};
