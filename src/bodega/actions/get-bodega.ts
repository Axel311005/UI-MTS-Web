import { bodegaApi } from '../api/bodega.api';
import type { Bodega } from '../types/bodega.interface';

export const getBodegasAction = async () => {
  const { data: bodegas } = await bodegaApi.get<Bodega[]>('/');
  // Mostrar solo bodegas activas (activo === 'ACTIVO')
  return (bodegas || []).filter((b) => b.activo === 'ACTIVO');
};
