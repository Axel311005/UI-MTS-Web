import { useQuery } from '@tanstack/react-query';
import { getItemAction } from '../actions/get-item';
import type { ItemResponse } from '../types/item.response';

export const useItem = () => {
  const query = useQuery<ItemResponse[]>({
    queryKey: ['item'],
    queryFn: getItemAction,
    staleTime: 1000 * 60 * 5,
  });
  return {
    items: query.data,
  };
};
