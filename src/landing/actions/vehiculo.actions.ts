import { landingVehiculoApi } from '../api/vehiculo.api';
import type { Vehiculo } from '../types/cita.types';

export const getVehiculosByCliente = async (
  clienteId: number
): Promise<Vehiculo[]> => {
  try {
    // Usar el endpoint específico para obtener vehículos del cliente
    const response = await landingVehiculoApi.get<Vehiculo[]>(
      `/cliente/${clienteId}`
    );

    const data = response.data;
    const vehiculos = Array.isArray(data) ? data : [];

    return vehiculos;
  } catch (error: any) {
    return [];
  }
};

export const createVehiculo = async (payload: {
  idCliente: number;
  placa: string;
  motor: string;
  marca: string;
  anio: number;
  modelo: string;
  color: string;
  numChasis: string;
}): Promise<Vehiculo> => {
  try {
    const { data } = await landingVehiculoApi.post<Vehiculo>('/', {
      ...payload,
      activo: 'ACTIVO',
    });
    return data;
  } catch (error) {
    throw error;
  }
};
