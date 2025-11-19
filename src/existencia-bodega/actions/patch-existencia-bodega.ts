import { existenciaBodegaApi } from '../api/existenciaBodega.api';

export interface UpdateExistenciaBodegaPayload {
  existenciaMaxima?: number;
  existenciaMinima?: number;
  puntoDeReorden?: number;
}

type RawPatchExistenciaBodegaResponse = Record<string, any> | null | undefined;

export const patchExistenciaBodega = async (
  id: number,
  payload: UpdateExistenciaBodegaPayload
) => {
  if (!Number.isFinite(id)) {
    throw new Error('ID de existencia de bodega inválido');
  }

  const body: Record<string, unknown> = {};

  if (typeof payload.existenciaMaxima === 'number' && payload.existenciaMaxima >= 0) {
    body.existenciaMaxima = payload.existenciaMaxima;
  }

  if (typeof payload.existenciaMinima === 'number' && payload.existenciaMinima >= 0) {
    body.existenciaMinima = payload.existenciaMinima;
  }

  if (typeof payload.puntoDeReorden === 'number' && payload.puntoDeReorden >= 0) {
    body.puntoDeReorden = payload.puntoDeReorden;
  }

  if (Object.keys(body).length === 0) {
    throw new Error(
      'No se proporcionaron datos para actualizar la existencia de bodega'
    );
  }

  const { data } =
    await existenciaBodegaApi.patch<RawPatchExistenciaBodegaResponse>(
      `/${id}`,
      body
    );

  const existenciaBodegaId = Number(
    (data as any)?.idExistenciaBodega ??
      (data as any)?.id_existencia_bodega ??
      (data as any)?.id ??
      id
  );

  if (!Number.isFinite(existenciaBodegaId)) {
    throw new Error('No se pudo actualizar la existencia de bodega');
  }

  return { existenciaBodegaId, raw: data };
};

