import { facturaLineaApi } from '../api/factura-linea.api';

type RawResponse = Record<string, any>;

export const deleteFacturaLinea = async (id: number) => {
  const { data } = await facturaLineaApi.delete<RawResponse>(`/${id}`);
  return { raw: data };
};

