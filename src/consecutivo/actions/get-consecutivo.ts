import { consecutivoApi } from '../api/consecutivo.api';
import type { Consecutivo } from '../types/consecutivo.response';

export const getConsecutivoAction = async () => {
  const { data: consecutivos } = await consecutivoApi.get<Consecutivo[]>('/');

  return consecutivos;
};
