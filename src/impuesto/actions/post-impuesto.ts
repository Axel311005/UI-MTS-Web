import { impuestoApi } from '../api/impuesto.api';
import { EstadoActivo } from '@/shared/types/status';

export interface CreateImpuestoPayload {
  descripcion: string;
  porcentaje: number;
  activo: EstadoActivo;
}

type RawPostImpuestoResponse = Record<string, any> | null | undefined;

export const postImpuesto = async (payload: CreateImpuestoPayload) => {
  const body = {
    descripcion: payload.descripcion?.trim() ?? '',
    porcentaje: payload.porcentaje ?? 0,
    activo: payload.activo ?? EstadoActivo.ACTIVO,
  };

  const { data } = await impuestoApi.post<RawPostImpuestoResponse>('/', body);

  const impuestoId = Number(
    (data as any)?.idImpuesto ??
      (data as any)?.id_impuesto ??
      (data as any)?.id ??
      (data as any)?.Id
  );

  if (!Number.isFinite(impuestoId)) {
    throw new Error('No se pudo crear el impuesto');
  }

  return { impuestoId, raw: data };
};

