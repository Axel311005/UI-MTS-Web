import { UnidadMedidaApi } from '../api/unidadMedida.api';

export interface CreateUnidadMedidaPayload {
  descripcion: string;
}

type RawPostUnidadMedidaResponse = Record<string, any> | null | undefined;

export const postUnidadMedida = async (payload: CreateUnidadMedidaPayload) => {
  const body = {
    descripcion: payload.descripcion?.trim() ?? '',
  };

  const { data } =
    await UnidadMedidaApi.post<RawPostUnidadMedidaResponse>('/', body);

  const unidadMedidaId = Number(
    (data as any)?.idUnidadMedida ??
      (data as any)?.id_unidad_medida ??
      (data as any)?.id ??
      (data as any)?.Id
  );

  if (!Number.isFinite(unidadMedidaId)) {
    throw new Error('No se pudo crear la unidad de medida');
  }

  return { unidadMedidaId, raw: data };
};

