import type { Cliente } from '../types/cliente.interface';

/**
 * Helper function to get the full name of a cliente
 * Combines primerNombre and primerApellido, or returns RUC if names are null
 */
export const getClienteNombre = (cliente: Cliente | null | undefined): string => {
  if (!cliente) return '—';
  const nombre = cliente.primerNombre?.trim() ?? '';
  const apellido = cliente.primerApellido?.trim() ?? '';
  if (nombre || apellido) {
    return [nombre, apellido].filter(Boolean).join(' ');
  }
  return cliente.ruc || '—';
};

/**
 * Helper function to get searchable text from a cliente
 * Includes primerNombre, primerApellido, ruc, telefono, direccion, notas
 */
export const getClienteSearchText = (cliente: Cliente): string => {
  const parts = [
    cliente.primerNombre,
    cliente.primerApellido,
    cliente.ruc,
    cliente.telefono,
    cliente.direccion,
    cliente.notas,
  ];
  return parts.filter(Boolean).join(' ').toLowerCase();
};

