/**
 * Utilidades de validación centralizadas para todo el proyecto
 */

import {
  validateNoRepeatedChars,
  sanitizeStringNoRepeats,
  sanitizeString,
  detectSQLInjection,
} from './security';
import { smartValidate } from './smart-validation';

/**
 * Resultado de una validación
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Valida longitud de texto con mínimo y máximo
 */
export function validateLength(
  text: string,
  min: number,
  max: number
): { isValid: boolean; error?: string } {
  if (!text || typeof text !== 'string') {
    return {
      isValid: false,
      error: `Debe tener entre ${min} y ${max} caracteres`,
    };
  }

  const trimmed = text.trim();
  if (trimmed.length < min) {
    return {
      isValid: false,
      error: `Debe tener al menos ${min} caracteres`,
    };
  }

  if (trimmed.length > max) {
    return {
      isValid: false,
      error: `No puede tener más de ${max} caracteres`,
    };
  }

  return { isValid: true };
}

/**
 * Valida texto con longitud, caracteres repetidos y SQL Injection
 * Ahora incluye validaciones inteligentes para reducir basura
 */
export function validateText(
  text: string,
  min: number,
  max: number,
  allowRepeats: boolean = false
): { isValid: boolean; error?: string } {
  // Validar longitud
  const lengthValidation = validateLength(text, min, max);
  if (!lengthValidation.isValid) {
    return lengthValidation;
  }

  // Validar SQL Injection
  if (detectSQLInjection(text)) {
    return {
      isValid: false,
      error: 'El texto contiene patrones no permitidos (SQL Injection)',
    };
  }

  // Validar caracteres repetidos si no se permite
  if (!allowRepeats && !validateNoRepeatedChars(text.trim())) {
    return {
      isValid: false,
      error: 'No puede tener 3 o más caracteres consecutivos iguales',
    };
  }

  // Aplicar validaciones inteligentes adicionales
  const smartResult = smartValidate(text.trim(), {
    minLength: min,
    maxLength: max,
    allowNumbers: true,
    allowSpecialChars: true,
    maxRepetitions: allowRepeats ? 10 : 3,
    maxConsonantsInRow: 5,
    maxRepetitivePercentage: 50,
    maxSymbolPercentage: 20,
  });

  if (!smartResult.isValid) {
    return {
      isValid: false,
      error: smartResult.error || 'El texto no es válido',
    };
  }

  return { isValid: true };
}

/**
 * Sanitiza texto con validación de longitud y repeticiones
 */
export function sanitizeText(
  text: string,
  _min: number, // Parámetro para compatibilidad, se valida en validateText
  max: number,
  allowRepeats: boolean = false
): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  let sanitized = text.trim();

  // Eliminar repeticiones si no se permite
  if (!allowRepeats) {
    sanitized = sanitizeStringNoRepeats(sanitized, max);
  } else {
    sanitized = sanitizeString(sanitized, max);
  }

  // Limitar a máximo
  if (sanitized.length > max) {
    sanitized = sanitized.slice(0, max);
  }

  return sanitized;
}

/**
 * Valida rango de números (precios, cantidades, etc.)
 */
export function validateRange(
  value: number | string,
  minValue: number,
  maxValue: number,
  fieldName: string = 'Valor'
): { isValid: boolean; error?: string } {
  const num = typeof value === 'string' ? Number(value) : value;

  if (!Number.isFinite(num)) {
    return { isValid: false, error: `${fieldName} debe ser un número válido` };
  }

  if (num < minValue) {
    return {
      isValid: false,
      error: `${fieldName} debe ser al menos ${minValue}`,
    };
  }

  if (num > maxValue) {
    return {
      isValid: false,
      error: `${fieldName} no puede ser mayor a ${maxValue}`,
    };
  }

  return { isValid: true };
}

/**
 * Valida precio (rango razonable)
 */
export function validatePrecio(
  precio: number | string,
  max: number = 1000000
): { isValid: boolean; error?: string } {
  return validateRange(precio, 0, max, 'El precio');
}

/**
 * Valida cantidad (mínimo 1, máximo razonable)
 */
export function validateCantidad(
  cantidad: number | string,
  max: number = 100000
): { isValid: boolean; error?: string } {
  const num = typeof cantidad === 'string' ? Number(cantidad) : cantidad;

  if (!Number.isFinite(num) || num <= 0) {
    return { isValid: false, error: 'La cantidad debe ser mayor a 0' };
  }

  return validateRange(cantidad, 1, max, 'La cantidad');
}

/**
 * Valida descuento (0-90%)
 */
export function validateDescuento(descuento: number | string): {
  isValid: boolean;
  error?: string;
} {
  return validateRange(descuento, 0, 90, 'El descuento');
}

/**
 * Valida porcentaje (0-100%)
 */
export function validatePorcentaje(
  porcentaje: number | string,
  max: number = 100
): { isValid: boolean; error?: string } {
  return validateRange(porcentaje, 0, max, 'El porcentaje');
}

/**
 * Valida existencia (mínima, máxima, punto de reorden)
 */
export function validateExistencia(
  existencia: number | string,
  max: number = 1000000
): { isValid: boolean; error?: string } {
  return validateRange(existencia, 0, max, 'La existencia');
}

/**
 * Obtiene la fecha máxima permitida (hoy + 1 año)
 * @returns Fecha máxima (hoy + 1 año)
 */
export function getFechaMaxima(): Date {
  const hoy = new Date();
  const maxDate = new Date(hoy);
  maxDate.setFullYear(hoy.getFullYear() + 1);
  return maxDate;
}

/**
 * Obtiene la fecha mínima permitida (inicio del año actual: 1 de enero)
 * @returns Fecha mínima (1 de enero del año actual)
 */
export function getFechaMinima(): Date {
  const hoy = new Date();
  const añoActual = hoy.getFullYear();
  const fechaMinima = new Date(añoActual, 0, 1); // 1 de enero del año actual
  fechaMinima.setHours(0, 0, 0, 0); // Normalizar a inicio del día
  return fechaMinima;
}

/**
 * Valida fechas (rango mínimo y máximo)
 * Por defecto, la fecha mínima es el inicio del año actual (1 de enero)
 * Por defecto, la fecha máxima es hoy + 1 año
 * @param fecha - Fecha a validar
 * @param minDate - Fecha mínima permitida (default: 1 de enero del año actual)
 * @param maxDate - Fecha máxima permitida (default: hoy + 1 año)
 * @returns Objeto con isValid y error opcional
 */
export function validateFecha(
  fecha: string | Date,
  minDate?: Date | null,
  maxDate?: Date | null
): { isValid: boolean; error?: string } {
  if (!fecha) {
    return { isValid: false, error: 'La fecha es requerida' };
  }

  const date = typeof fecha === 'string' ? new Date(fecha) : fecha;

  if (isNaN(date.getTime())) {
    return { isValid: false, error: 'La fecha no es válida' };
  }

  // Usar fecha mínima por defecto (1 de enero del año actual) si no se especifica
  const fechaMinima = minDate ?? getFechaMinima();
  if (date < fechaMinima) {
    return {
      isValid: false,
      error: `La fecha no puede ser anterior a ${fechaMinima.toLocaleDateString()}`,
    };
  }

  // Usar fecha máxima por defecto (hoy + 1 año) si no se especifica
  const fechaMaxima = maxDate ?? getFechaMaxima();
  if (date > fechaMaxima) {
    return {
      isValid: false,
      error: `La fecha no puede ser posterior a ${fechaMaxima.toLocaleDateString()}`,
    };
  }

  return { isValid: true };
}

/**
 * Valida que una fecha de fin sea posterior a la fecha de inicio
 */
export function validateFechaRango(
  fechaInicio: string | Date,
  fechaFin: string | Date
): { isValid: boolean; error?: string } {
  const inicio =
    typeof fechaInicio === 'string' ? new Date(fechaInicio) : fechaInicio;
  const fin = typeof fechaFin === 'string' ? new Date(fechaFin) : fechaFin;

  if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
    return { isValid: false, error: 'Las fechas no son válidas' };
  }

  if (fin < inicio) {
    return {
      isValid: false,
      error: 'La fecha de fin debe ser posterior a la fecha de inicio',
    };
  }

  return { isValid: true };
}

/**
 * Constantes de validación para campos comunes
 */
export const VALIDATION_RULES = {
  // Textos generales
  direccion: { min: 5, max: 200 },
  notas: { min: 0, max: 1000 },
  comentario: { min: 0, max: 500 },
  observaciones: { min: 0, max: 1000 },
  descripcion: { min: 2, max: 200 },
  descripcionCorta: { min: 2, max: 100 },

  // Códigos e identificadores
  codigo: { min: 2, max: 50 },
  ruc: { min: 10, max: 14 },
  placa: { min: 3, max: 20 },

  // Números
  precio: { min: 0, max: 1000000 },
  cantidad: { min: 1, max: 100000 },
  descuento: { min: 0, max: 90 },
  porcentaje: { min: 0, max: 100 },
  existencia: { min: 0, max: 1000000 },

  // Fechas (se calculan dinámicamente)
  get fechaMinima() {
    return getFechaMinima();
  },
  get fechaMaxima() {
    return getFechaMaxima();
  },
} as const;

/**
 * Validaciones inteligentes exportadas para uso directo
 */
export {
  smartValidate,
  validateName,
  validateAddress,
  validateDescription,
  validateCode,
  validateSearch,
  type SmartValidationResult,
} from './smart-validation';
