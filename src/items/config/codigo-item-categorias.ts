/**
 * Utilidades para generar y validar códigos SKU de items
 * Formato: XXX-00000 (código + guion + 5 dígitos)
 *
 * Las categorías están en: src/items/data/codigo-item-categorias.ts
 */

import {
  CODIGO_ITEM_CATEGORIAS,
  type CodigoItemCategoria,
} from '../data/codigo-item-categorias';

// Re-exportar el tipo para mantener compatibilidad
export type { CodigoItemCategoria };

/**
 * Obtiene las categorías filtradas por tipo de item
 */
export function getCategoriasByTipo(
  tipo: 'PRODUCTO' | 'SERVICIO'
): CodigoItemCategoria[] {
  return CODIGO_ITEM_CATEGORIAS.filter((cat) => cat.tipo === tipo);
}

/**
 * Formatea un número a 5 dígitos con ceros a la izquierda
 */
export function formatCodigoConsecutivo(numero: string | number): string {
  const num = typeof numero === 'string' ? parseInt(numero, 10) : numero;
  if (isNaN(num) || num < 0) return '00000';
  return String(num).padStart(5, '0');
}

/**
 * Valida el formato del código completo (XXX-00000)
 */
export function validateCodigoItemFormat(codigo: string): boolean {
  if (!codigo || typeof codigo !== 'string') return false;
  const pattern = /^[A-Z]{3}-\d{5}$/;
  return pattern.test(codigo.trim().toUpperCase());
}

/**
 * Genera el código completo a partir del código de categoría y el consecutivo
 */
export function generateCodigoItem(
  codigoCategoria: string,
  consecutivo: string | number
): string {
  const codigo = codigoCategoria.trim().toUpperCase().replace(/-$/, ''); // Remover guion si existe
  const consecutivoFormateado = formatCodigoConsecutivo(consecutivo);
  return `${codigo}-${consecutivoFormateado}`;
}

/**
 * Parsea un código completo (XXX-00000 o XXX-000) en sus componentes
 * @param codigoCompleto - Código completo en formato XXX-00000 o variaciones
 * @returns Objeto con codigoCategoria (con guion) y codigoConsecutivo, o null si no es válido
 */
export function parseCodigoItem(codigoCompleto: string): {
  codigoCategoria: string;
  codigoConsecutivo: string;
} | null {
  if (!codigoCompleto || typeof codigoCompleto !== 'string') return null;

  const trimmed = codigoCompleto.trim().toUpperCase();

  // Intentar diferentes formatos:
  // 1. Formato exacto XXX-00000 (5 dígitos)
  let match = trimmed.match(/^([A-Z]{3})-(\d{5})$/);

  // 2. Formato XXX-000 (menos dígitos, pero válido)
  if (!match) {
    match = trimmed.match(/^([A-Z]{3})-(\d+)$/);
  }

  // 3. Formato sin guion pero con 3 letras al inicio seguido de números
  if (!match) {
    match = trimmed.match(/^([A-Z]{3})(\d+)$/);
  }

  if (!match) return null;

  const codigoCategoria = match[1];
  const consecutivoRaw = match[2];

  // Remover ceros a la izquierda del consecutivo
  let codigoConsecutivo = consecutivoRaw.replace(/^0+/, '');

  // Si después de remover ceros queda vacío o es '0', significa que era '00000' o '0'
  // No permitir estos valores, retornar null para indicar que no es válido
  if (!codigoConsecutivo || codigoConsecutivo === '0') {
    return null;
  }

  return {
    codigoCategoria: `${codigoCategoria}-`, // Incluir el guion
    codigoConsecutivo: codigoConsecutivo,
  };
}
