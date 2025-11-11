import { bodegaApi } from '../api/bodega.api';

export const postBodegaAction = async (payload: { descripcion: string }) => {
  // Backend defaults 'activo' to ACTIVO, only descripcion is required
  const { data } = await bodegaApi.post('/', {
    descripcion: payload.descripcion,
  });
  return data;
};
