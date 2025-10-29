import { UnidadMedidaApi } from "../api/unidadMedida.api";
import type { UnidadMedida } from "../types/unidadMedida.interface";

export const getUnidadMedidasAction = async () => {
  const { data: unidadMedidas } = await UnidadMedidaApi.get<UnidadMedida[]>('/');

  return unidadMedidas;
};
