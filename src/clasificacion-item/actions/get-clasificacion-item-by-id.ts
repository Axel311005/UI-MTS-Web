import { clasificacionItemApi } from '../api/clasificacionItem.api';
import type { ClasificacionItem } from '../types/clasificacionItem.interface';

export const getClasificacionItemById = async (id: number) => {
  if (!Number.isFinite(id)) {
    throw new Error('ID de clasificación inválido');
  }

  const { data } = await clasificacionItemApi.get<ClasificacionItem>(`/${id}`);

  if (!data) {
    throw new Error('No se encontró la clasificación solicitada');
  }

  return data;
};
