import { vehiculoApi } from '../api/vehiculo.api';
import type { Vehiculo } from '../types/vehiculo.interface';

export const getVehiculoById = async (idVehiculo: number) => {
  if (!Number.isFinite(idVehiculo)) throw new Error('ID de vehículo inválido');
  const { data } = await vehiculoApi.get<Vehiculo>(`/${idVehiculo}`);
  return data;
};
