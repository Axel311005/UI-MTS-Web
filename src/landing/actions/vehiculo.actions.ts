import { landingVehiculoApi } from '../api/vehiculo.api';
import type { Vehiculo } from '../types/cita.types';

export const getVehiculosByCliente = async (
  clienteId: number
): Promise<Vehiculo[]> => {
  try {
    console.log('🔍 Buscando vehículos para clienteId:', clienteId);
    console.log('🔍 URL completa:', `${landingVehiculoApi.defaults.baseURL}/cliente/${clienteId}`);

    // Usar el endpoint específico para obtener vehículos del cliente
    const response = await landingVehiculoApi.get<Vehiculo[]>(
      `/cliente/${clienteId}`
    );
    console.log('📦 Respuesta completa:', response);
    console.log('📦 Response data:', response.data);
    console.log('📦 Response status:', response.status);
    console.log('📦 Tipo de data:', typeof response.data);
    console.log('📦 Es array?', Array.isArray(response.data));

    const data = response.data;
    const vehiculos = Array.isArray(data) ? data : [];
    console.log('✅ Vehículos procesados:', vehiculos.length);
    console.log('✅ Vehículos:', JSON.stringify(vehiculos, null, 2));

    return vehiculos;
  } catch (error: any) {
    console.error('❌ Error obteniendo vehículos:', error);
    console.error('❌ Error response:', error?.response);
    console.error('❌ Error response data:', error?.response?.data);
    console.error('❌ Error response status:', error?.response?.status);
    if (error instanceof Error) {
      console.error('Mensaje:', error.message);
      console.error('Stack:', error.stack);
    }
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
    console.error('❌ Error creando vehículo:', error);
    throw error;
  }
};
