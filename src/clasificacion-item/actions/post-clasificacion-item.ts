import { clasificacionItemApi } from '../api/clasificacionItem.api';

export interface CreateClasificacionItemPayload {
  descripcion: string;
}

type RawPostClasificacionItemResponse = Record<string, any> | null | undefined;

export const postClasificacionItem = async (
  payload: CreateClasificacionItemPayload
) => {
  const body = {
    descripcion: payload.descripcion?.trim() ?? '',
  };

  const { data } =
    await clasificacionItemApi.post<RawPostClasificacionItemResponse>(
      '/',
      body
    );

  const clasificacionId = Number(
    (data as any)?.idClasificacion ??
      (data as any)?.id_clasificacion ??
      (data as any)?.id ??
      (data as any)?.Id
  );

  if (!Number.isFinite(clasificacionId)) {
    throw new Error('No se pudo crear la clasificación');
  }

  return { clasificacionId, raw: data };
};
