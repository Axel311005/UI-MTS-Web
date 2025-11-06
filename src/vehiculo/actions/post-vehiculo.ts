import { vehiculoApi } from '../api/vehiculo.api';

// Payload de creación de vehículo. Inferido: usar IDs de entidades relacionadas.
export interface CreateVehiculoPayload {
  idCliente: number;
  placa: string;
  motor?: string;
  marca?: string;
  anio?: number;
  modelo?: string;
  color?: string;
  numChasis?: string;
}

export const postVehiculoAction = async (payload: CreateVehiculoPayload) => {
  if (!payload?.idCliente || !payload?.placa) {
    throw new Error('Faltan campos requeridos: idCliente y placa');
  }
  const { data } = await vehiculoApi.post('/', payload);
  return data;
};
