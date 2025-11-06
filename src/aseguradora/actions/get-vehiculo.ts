import { AseguradoraApi } from "../api/aseguradora.api";
import type { Aseguradora } from "../types/aseguradora.interface";

export const getAseguradoraAction = async () => {
  const { data: aseguradoras } = await AseguradoraApi.get<Aseguradora[]>('/');

  return aseguradoras;
};
