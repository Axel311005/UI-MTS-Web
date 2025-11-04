import { useQuery } from '@tanstack/react-query';

import { getExistenciaBodegasAction } from '../actions/get-existencia-bodega';
import type { ExistenciaBodega } from '../types/existenciaBodega.interface';

// Nota: usamos un queryKey único para no colisionar con el de bodega
export const useExistenciaBodega = () => {
  const query = useQuery<ExistenciaBodega[]>({
    queryKey: ['existencia-bodega'],
    queryFn: getExistenciaBodegasAction,
    staleTime: 1000 * 60 * 5,
  });
  return {
    existencias: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};

// Compatibilidad hacia atrás si en algún lugar se importó useBodega
export const useBodega = useExistenciaBodega;
