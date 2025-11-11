import { existenciaBodegaApi } from '../api/existenciaBodega.api';

export interface CreateExistenciaBodegaPayload {
  itemId: number;
  bodegaId: number;
  cantDisponible: number;
  existenciaMaxima: number;
  existenciaMinima: number;
  puntoDeReorden: number;
}

type RawPostExistenciaBodegaResponse = Record<string, any> | null | undefined;

export const postExistenciaBodega = async (
  payload: CreateExistenciaBodegaPayload
) => {
  const body = {
    itemId: payload.itemId,
    bodegaId: payload.bodegaId,
    cantDisponible: payload.cantDisponible,
    existenciaMaxima: payload.existenciaMaxima,
    existenciaMinima: payload.existenciaMinima,
    puntoDeReorden: payload.puntoDeReorden,
  };

  const { data } =
    await existenciaBodegaApi.post<RawPostExistenciaBodegaResponse>('/', body);

  const existenciaBodegaId = Number(
    (data as any)?.idExistenciaBodega ??
      (data as any)?.id_existencia_bodega ??
      (data as any)?.id ??
      (data as any)?.Id
  );

  if (!Number.isFinite(existenciaBodegaId)) {
    // eslint-disable-next-line no-console
    console.error('[postExistenciaBodega] Respuesta inesperada:', data);
    throw new Error('No se pudo crear la existencia de bodega');
  }

  return { existenciaBodegaId, raw: data };
};

