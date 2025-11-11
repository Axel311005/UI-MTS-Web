import type { Cliente } from '@/clientes/types/cliente.interface';
import type { EstadoActivo } from '@/shared/types/status';

export interface Vehiculo {
  idVehiculo: number;
  cliente: Cliente;
  placa: string;
  motor: string;
  marca: string;
  anio: number;
  modelo: string;
  color: string;
  numChasis: string;
  activo: EstadoActivo;
  fechaCreacion: Date;
}
