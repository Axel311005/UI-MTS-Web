import { vehiculoApi } from '../api/vehiculo.api';
import type { EstadoActivo } from '@/shared/types/status';

export interface UpdateVehiculoPayload {
  idCliente?: number;
  placa?: string;
  motor?: string;
  marca?: string;
  anio?: number;
  modelo?: string;
  color?: string;
  numChasis?: string;
  activo?: EstadoActivo;
}

export const patchVehiculoAction = async (
  idVehiculo: number,
  payload: UpdateVehiculoPayload
) => {
  if (!Number.isFinite(idVehiculo)) throw new Error('ID de vehículo inválido');
  const { data } = await vehiculoApi.patch(`/${idVehiculo}`, payload);
  return data;
};
