import { monedaApi } from '../api/moneda.api';
import { EstadoActivo } from '@/shared/types/status';

export interface CreateMonedaPayload {
  descripcion: string;
  tipoCambio: number;
  activo: EstadoActivo;
}

type RawPostMonedaResponse = Record<string, any> | null | undefined;

export const postMoneda = async (payload: CreateMonedaPayload) => {
  const body = {
    descripcion: payload.descripcion?.trim() ?? '',
    tipoCambio: payload.tipoCambio ?? 0,
    activo: payload.activo ?? EstadoActivo.ACTIVO,
  };

  const { data } = await monedaApi.post<RawPostMonedaResponse>('/', body);

  const monedaId = Number(
    (data as any)?.idMoneda ??
      (data as any)?.id_moneda ??
      (data as any)?.id ??
      (data as any)?.Id
  );

  if (!Number.isFinite(monedaId)) {
    // eslint-disable-next-line no-console
    console.error('[postMoneda] Respuesta inesperada:', data);
    throw new Error('No se pudo crear la moneda');
  }

  return { monedaId, raw: data };
};

