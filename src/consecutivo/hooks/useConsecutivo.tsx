import { useQuery } from '@tanstack/react-query';
import { getConsecutivoAction } from '../actions/get-consecutivo';
import type { Consecutivo } from '../types/consecutivo.response';

export const useConsecutivo = () => {
  const query = useQuery<Consecutivo[]>({
    queryKey: ['consecutivos'],
    queryFn: getConsecutivoAction,
    staleTime: 1000 * 60 * 5,
  });
  return {
    consecutivos: query.data,
  };
};

export default useConsecutivo;
