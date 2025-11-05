import { itemApi } from '../api/item.api';
import { EstadoActivo } from '@/shared/types/status';

export type ItemTipo = 'PRODUCTO' | 'SERVICIO';

export interface CreateItemPayload {
  clasificacionId: number;
  unidadMedidaId: number;
  codigoItem: string;
  descripcion: string;
  tipo: ItemTipo;
  precioBaseLocal: number;
  precioBaseDolar: number;
  precioAdquisicionLocal: number;
  precioAdquisicionDolar: number;
  esCotizable: boolean;
  ultimaSalida: string | null;
  ultimoIngreso: string | null;
  usuarioUltModif: string;
  fechaUltModif: string | null;
  perecedero: boolean;
  activo: EstadoActivo;
}

export const postItem = async (payload: CreateItemPayload) => {
  const { data } = await itemApi.post('/', payload);
  return data;
};
