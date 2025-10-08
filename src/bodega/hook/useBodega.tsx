import { useQuery } from '@tanstack/react-query';
import { getBodegasAction } from '../actions/get-bodega';

import type { Bodega } from '../types/bodega.interface';

export const useBodega = () => {
  const query = useQuery<Bodega[]>({
    queryKey: ['bodegas'],
    queryFn: getBodegasAction,
    staleTime: 1000 * 60 * 5,
  });
  return {
    bodegas: query.data,
  };
};
