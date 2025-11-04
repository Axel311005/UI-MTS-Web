import { useQuery } from '@tanstack/react-query';
import type { UnidadMedida } from '../types/unidadMedida.interface';
import { getUnidadMedidasAction } from '../actions/get-unidad-medida';

export const useUnidadMedida = () => {
  const query = useQuery<UnidadMedida[]>({
    queryKey: ['unidadMedidas'],
    queryFn: getUnidadMedidasAction,
    staleTime: 1000 * 60 * 10,
  });
  return {
    unidadMedidas: query.data ?? [],
  };
};
