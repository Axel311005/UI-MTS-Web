import { existenciaBodegaApi } from "../api/existenciaBodega.api";
import type { ExistenciaBodega } from "../types/existenciaBodega.interface";

export const getExistenciaBodegasAction = async () => {
  const { data: existenciaBodegas } = await existenciaBodegaApi.get<ExistenciaBodega[]>('/');

  return existenciaBodegas;
};
