import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getItemAction } from '../actions/get-item';
import type { ItemResponse } from '../types/item.response';
import { useExistenciaBodega } from '@/existencia-bodega/hook/useExistenciaBodega';

interface UseItemOptions {
  bodegaId?: number | '';
  onlyWithStock?: boolean; // si true, filtra por stock > 0 en la bodega
  onlyActive?: boolean; // por defecto true: ocultar ítems inactivos
}

export const useItem = (options?: UseItemOptions) => {
  const query = useQuery<ItemResponse[]>({
    queryKey: ['items'],
    queryFn: getItemAction,
    staleTime: 1000 * 60 * 5,
  });

  const { existencias } = useExistenciaBodega();

  const stockMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const ex of existencias ?? []) {
      const bId = (ex as any)?.bodega?.idBodega;
      const iId = (ex as any)?.item?.idItem;
      const key = `${bId}-${iId}`;
      const cantidad = Number((ex as any)?.cantDisponible ?? 0) || 0;
      map.set(key, cantidad);
    }
    return map;
  }, [existencias]);

  const items = useMemo(() => {
    const base0 = query.data ?? [];
    const isActive = (i: ItemResponse) =>
      (i as any)?.activo !== false && (i as any)?.estado !== 'INACTIVO';
    const base = options?.onlyActive === false ? base0 : base0.filter(isActive);
    const bId =
      typeof options?.bodegaId === 'number' ? options?.bodegaId : undefined;
    if (!options?.onlyWithStock || bId === undefined) return base;
    return base.filter((i) => (stockMap.get(`${bId}-${i.idItem}`) ?? 0) > 0);
  }, [
    query.data,
    stockMap,
    options?.onlyWithStock,
    options?.bodegaId,
    options?.onlyActive,
  ]);

  return {
    items,
    allItems: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};
