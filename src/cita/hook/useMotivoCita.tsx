import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { getMotivosCitaAction } from "../actions/get-motivo-cita";
import type { MotivoCita } from "../types/motivo-cita.interface";
import type { PaginatedResponse } from "@/shared/types/pagination";
import { EstadoActivo } from "@/shared/types/status";

interface UseMotivoCitaOptions {
  limit?: number;
  offset?: number;
  usePagination?: boolean;
}

export const useMotivoCita = (options?: UseMotivoCitaOptions) => {
  const paginationParams = options?.usePagination
    ? { limit: options.limit ?? 10, offset: options.offset ?? 0 }
    : undefined;

  const query = useQuery<PaginatedResponse<MotivoCita> | MotivoCita[]>({
    queryKey: [
      "motivosCita",
      paginationParams?.limit,
      paginationParams?.offset,
      "filtered-activos",
    ],
    queryFn: () => getMotivosCitaAction(paginationParams),
    staleTime: paginationParams ? 0 : 1000 * 60 * 5,
  });

  const motivosCita = useMemo(() => {
    if (!query.data) return [] as MotivoCita[];

    const items = Array.isArray(query.data)
      ? query.data
      : (query.data as PaginatedResponse<MotivoCita>).data || [];

    return items.filter((motivo) => motivo.estado !== EstadoActivo.INACTIVO);
  }, [query.data]);

  const totalItems = useMemo(() => {
    if (!query.data) return 0;
    if (Array.isArray(query.data)) return motivosCita.length;

    const total = (query.data as PaginatedResponse<MotivoCita>).total;
    return typeof total === "number" ? total : motivosCita.length;
  }, [query.data, motivosCita]);

  return {
    motivosCita,
    totalItems,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};
