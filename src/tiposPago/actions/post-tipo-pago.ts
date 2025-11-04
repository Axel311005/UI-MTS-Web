import { tipoPagoApi } from '../api/tipoPago.api';

export interface CreateTipoPagoPayload {
  descripcion: string;
}

type RawPostTipoPagoResponse = Record<string, any> | null | undefined;

export const postTipoPago = async (payload: CreateTipoPagoPayload) => {
  const body = {
    descripcion: payload.descripcion?.trim() ?? '',
  };

  const { data } = await tipoPagoApi.post<RawPostTipoPagoResponse>('/', body);

  const tipoPagoId = Number(
    (data as any)?.idTipoPago ??
      (data as any)?.id_tipo_pago ??
      (data as any)?.id ??
      (data as any)?.Id
  );

  if (!Number.isFinite(tipoPagoId)) {
    // eslint-disable-next-line no-console
    console.error('[postTipoPago] Respuesta inesperada:', data);
    throw new Error('No se pudo crear el tipo de pago');
  }

  return { tipoPagoId, raw: data };
};

