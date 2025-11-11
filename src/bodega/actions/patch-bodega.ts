import { bodegaApi } from '../api/bodega.api';
import { EstadoActivo } from '@/shared/types/status';

export const patchBodegaAction = async (
  idBodega: number,
  payload: { descripcion?: string; activo?: EstadoActivo }
) => {
  if (!Number.isFinite(idBodega)) throw new Error('ID de bodega inválido');
  const { data } = await bodegaApi.patch(`/${idBodega}`, payload);
  return data;
};
