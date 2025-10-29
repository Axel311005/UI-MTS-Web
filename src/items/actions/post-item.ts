import { itemApi } from '../api/item.api';

export interface CreateItemPayload {
  clasificacionId: number;
  unidadMedidaId: number;
  codigoItem: string;
  descripcion: string;
  tipo: string;
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
  activo: boolean;
}

export const postItem = async (payload: CreateItemPayload) => {
  const { data } = await itemApi.post('/', payload);
  return data;
};
