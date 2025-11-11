import { bodegaApi } from '../api/bodega.api';
import type { Bodega } from '../types/bodega.interface';

export const getBodegaByIdAction = async (id: number) => {
  if (!Number.isFinite(id)) throw new Error('ID de bodega inválido');
  const { data } = await bodegaApi.get<Bodega>(`/${id}`);
  if (!data) throw new Error('No se encontró la bodega solicitada');
  return data;
};
