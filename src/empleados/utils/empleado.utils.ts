import type { Empleado } from '../types/empleado.interface';

/**
 * Helper function to get the full name of an empleado
 * Combines primerNombre and primerApellido
 */
export const getEmpleadoNombre = (empleado: Empleado | null | undefined): string => {
  if (!empleado) return '—';
  const nombre = empleado.primerNombre?.trim() ?? '';
  const apellido = empleado.primerApellido?.trim() ?? '';
  if (nombre || apellido) {
    return [nombre, apellido].filter(Boolean).join(' ');
  }
  return '—';
};

/**
 * Helper function to get searchable text from an empleado
 * Includes primerNombre, primerApellido, cedula, telefono, direccion
 */
export const getEmpleadoSearchText = (empleado: Empleado): string => {
  const parts = [
    empleado.primerNombre,
    empleado.primerApellido,
    empleado.cedula,
    empleado.telefono,
    empleado.direccion,
    empleado.cargo,
  ];
  return parts.filter(Boolean).join(' ').toLowerCase();
};

