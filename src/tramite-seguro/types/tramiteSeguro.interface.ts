import type { Aseguradora } from '@/aseguradora/types/aseguradora.interface';
import type { Cliente } from '@/clientes/types/cliente.interface';
import type { TramiteSeguroEstado } from '@/shared/types/status';
import type { Vehiculo } from '@/vehiculo/types/vehiculo.interface';

export interface TramiteSeguro {
  idTramiteSeguro: number;
  vehiculo?: Vehiculo | null;
  cliente?: Cliente | null;
  aseguradora?: Aseguradora | null;
  numeroTramite: string;
  estado: TramiteSeguroEstado;
  fechaInicio?: string | Date | null;
  fechaFin?: string | Date | null;
  observaciones?: string | null;
}
