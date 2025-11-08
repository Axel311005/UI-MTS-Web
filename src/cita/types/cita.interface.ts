import type { CitaEstado } from '@/shared/types/status';
import type { Cliente } from '@/clientes/types/cliente.interface';
import type { Vehiculo } from '@/vehiculo/types/vehiculo.interface';
import type { MotivoCita } from './motivo-cita.interface';

export interface Cita {
  idCita: number;
  cliente: Cliente;
  vehiculo: Vehiculo;
  motivoCita: MotivoCita;
  fechaInicio: string | Date;
  fechaFin: string | Date;
  estado: CitaEstado;
  canal: 'web' | 'telefono' | 'presencial';
  fechaCreacion: string | Date;
  fechaActualizacion: string | Date;
}

export interface CreateCitaPayload {
  idCliente: number;
  idVehiculo: number;
  idMotivoCita: number;
  fechaInicio: string; // ISO string
  estado: CitaEstado;
  canal: 'web' | 'telefono' | 'presencial';
}

export interface UpdateCitaPayload {
  idCliente?: number;
  idVehiculo?: number;
  idMotivoCita?: number;
  fechaInicio?: string;
  estado?: CitaEstado;
  canal?: 'web' | 'telefono' | 'presencial';
}

