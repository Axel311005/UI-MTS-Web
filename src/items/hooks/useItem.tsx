import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getItemAction } from '../actions/get-item';
import type { ItemResponse } from '../types/item.response';
import type { PaginatedResponse } from '@/shared/types/pagination';
import { useExistenciaBodega } from '@/existencia-bodega/hook/useExistenciaBodega';
import { EstadoActivo } from '@/shared/types/status';

interface UseItemOptions {
  bodegaId?: number | '';
  onlyWithStock?: boolean; // si true, filtra por stock > 0 en la bodega
  onlyActive?: boolean; // por defecto true: ocultar ítems inactivos
  limit?: number;
  offset?: number;
  usePagination?: boolean;
}

export const useItem = (options?: UseItemOptions) => {
  const paginationParams = options?.usePagination
    ? { limit: options.limit ?? 10, offset: options.offset ?? 0 }
    : undefined;

  const query = useQuery<PaginatedResponse<ItemResponse> | ItemResponse[]>({
    queryKey: ['items', paginationParams?.limit, paginationParams?.offset],
    queryFn: () => getItemAction(paginationParams),
    staleTime: paginationParams ? 0 : 1000 * 60 * 5, // No cachear cuando hay paginación
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

  // Extraer datos de la respuesta paginada o directa
  const rawData = useMemo(() => {
    if (!query.data) return [];
    if (Array.isArray(query.data)) return query.data;
    return (query.data as PaginatedResponse<ItemResponse>).data || [];
  }, [query.data]);

  const totalItems = useMemo(() => {
    if (!query.data) return 0;
    if (Array.isArray(query.data)) return query.data.length;
    return (query.data as PaginatedResponse<ItemResponse>).total ?? 0;
  }, [query.data]);

  const items = useMemo(() => {
    const base0 = rawData;
    const isActive = (i: ItemResponse) => {
      const activoVal = (i as any)?.activo ?? (i as any)?.estado;
      if (activoVal === true) return true;
      if (activoVal === false) return false;
      return String(activoVal).toUpperCase() === EstadoActivo.ACTIVO;
    };
    const base = options?.onlyActive === false ? base0 : base0.filter(isActive);
    const bId =
      typeof options?.bodegaId === 'number' ? options?.bodegaId : undefined;
    if (!options?.onlyWithStock || bId === undefined) return base;
    return base.filter((i) => (stockMap.get(`${bId}-${i.idItem}`) ?? 0) > 0);
  }, [
    rawData,
    stockMap,
    options?.onlyWithStock,
    options?.bodegaId,
    options?.onlyActive,
  ]);

  return {
    items,
    allItems: rawData,
    totalItems,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};
