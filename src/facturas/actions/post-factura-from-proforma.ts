import { facturaApi } from '../api/factura.api';
import type { PostFacturaFromProformaPayload } from '../types/post-factura-from-proforma.interface';

// Acción para crear una factura a partir de una proforma
export const postFacturaFromProformaAction = async (
  payload: PostFacturaFromProformaPayload
) => {
  // Validar campos requeridos
  if (!payload || typeof payload !== 'object') {
    throw new Error('Payload inválido');
  }

  if (!Number.isFinite(payload.proformaId) || payload.proformaId <= 0) {
    throw new Error('proformaId es requerido y debe ser un número válido');
  }

  if (!Number.isFinite(payload.recepcionId) || payload.recepcionId <= 0) {
    throw new Error('recepcionId es requerido y debe ser un número válido');
  }

  if (!Number.isFinite(payload.tipoPagoId) || payload.tipoPagoId <= 0) {
    throw new Error('tipoPagoId es requerido y debe ser un número válido');
  }

  if (!Number.isFinite(payload.bodegaId) || payload.bodegaId <= 0) {
    throw new Error('bodegaId es requerido y debe ser un número válido');
  }

  if (!Number.isFinite(payload.consecutivoId) || payload.consecutivoId <= 0) {
    throw new Error('consecutivoId es requerido y debe ser un número válido');
  }

  if (!Number.isFinite(payload.empleadoId) || payload.empleadoId <= 0) {
    throw new Error('empleadoId es requerido y debe ser un número válido');
  }

  if (
    !Number.isFinite(payload.porcentajeDescuento) ||
    payload.porcentajeDescuento < 0 ||
    payload.porcentajeDescuento > 100
  ) {
    throw new Error(
      'porcentajeDescuento debe ser un número entre 0 y 100'
    );
  }

  try {
    const { data } = await facturaApi.post('/from-proforma', payload);
    return data;
  } catch (error: any) {
    // Mejorar el mensaje de error
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      'No se pudo generar la factura desde la proforma';
    throw new Error(errorMessage);
  }
};
