import { compraLineaApi } from '../api/compra-linea.api';

type RawResponse = Record<string, any>;

export const deleteCompraLinea = async (id: number) => {
  const { data } = await compraLineaApi.delete<RawResponse>(`/${id}`);
  return { raw: data };
};
