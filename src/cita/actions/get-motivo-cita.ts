import axios from "axios";

import { motivoCitaApi } from "../api/motivo-cita.api";
import type { MotivoCita } from "../types/motivo-cita.interface";
import type {
  PaginationParams,
  PaginatedResponse,
} from "@/shared/types/pagination";
import { EstadoActivo } from "@/shared/types/status";

type MotivoCitaQueryParams = PaginationParams & {
  estado?: EstadoActivo;
};

const normalizeResponse = (
  data: MotivoCita[] | PaginatedResponse<MotivoCita>,
  params?: MotivoCitaQueryParams
) => {
  if (
    data &&
    typeof data === "object" &&
    "data" in data &&
    Array.isArray((data as any).data)
  ) {
    return data as PaginatedResponse<MotivoCita>;
  }

  const allItems = Array.isArray(data) ? data : [];
  return {
    data: allItems,
    total: allItems.length,
    limit: params?.limit,
    offset: params?.offset ?? 0,
  } as PaginatedResponse<MotivoCita>;
};

export const getMotivosCitaAction = async (params?: MotivoCitaQueryParams) => {
  const queryParams: Record<string, number | string> = {};
  if (params?.limit !== undefined) queryParams.limit = params.limit;
  if (params?.offset !== undefined) queryParams.offset = params.offset;
  if (params?.estado) queryParams.estado = params.estado;

  try {
    const { data } = await motivoCitaApi.get<
      MotivoCita[] | PaginatedResponse<MotivoCita>
    >("/", {
      params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
    });

    return normalizeResponse(data, params);
  } catch (error) {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 400 &&
      queryParams.estado !== undefined
    ) {
      const { estado, ...fallbackParams } = queryParams;
      const { data } = await motivoCitaApi.get<
        MotivoCita[] | PaginatedResponse<MotivoCita>
      >("/", {
        params: Object.keys(fallbackParams).length ? fallbackParams : undefined,
      });

      return normalizeResponse(data, params);
    }

    throw error;
  }
};
