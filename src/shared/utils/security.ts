/**
 * Utilidades de seguridad para prevenir XSS, validar inputs y sanitizar datos
 */

/**
 * Sanitiza una cadena de texto eliminando caracteres peligrosos y limitando la longitud
 * @param input - Texto a sanitizar
 * @param maxLength - Longitud máxima permitida (default: 500)
 * @returns Texto sanitizado
 */
export function sanitizeString(input: string, maxLength: number = 500): string {
  if (typeof input !== 'string') {
    return '';
  }

  // Eliminar caracteres de control y espacios al inicio/final
  let sanitized = input.trim();

  // Eliminar caracteres peligrosos para XSS
  sanitized = sanitized
    .replace(/[<>]/g, '') // Eliminar < y >
    .replace(/javascript:/gi, '') // Eliminar javascript:
    .replace(/on\w+=/gi, '') // Eliminar event handlers (onclick=, onerror=, etc.)
    .replace(/data:/gi, '') // Eliminar data: URLs
    .replace(/vbscript:/gi, ''); // Eliminar vbscript:

  // Limitar longitud
  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength);
  }

  return sanitized;
}

/**
 * Sanitiza un número asegurándose de que sea válido y esté dentro de un rango
 * @param input - Valor a sanitizar
 * @param min - Valor mínimo permitido
 * @param max - Valor máximo permitido
 * @returns Número sanitizado o undefined si es inválido
 */
export function sanitizeNumber(
  input: string | number | undefined | null,
  min?: number,
  max?: number
): number | undefined {
  if (input === undefined || input === null || input === '') {
    return undefined;
  }

  const num = typeof input === 'string' ? Number(input) : input;

  if (!Number.isFinite(num)) {
    return undefined;
  }

  if (min !== undefined && num < min) {
    return undefined;
  }

  if (max !== undefined && num > max) {
    return undefined;
  }

  return num;
}

/**
 * Valida un email
 * @param email - Email a validar
 * @returns true si es válido, false en caso contrario
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

/**
 * Valida que una cadena no contenga scripts o código malicioso
 * @param input - Texto a validar
 * @returns true si es seguro, false si contiene código potencialmente peligroso
 */
export function isSafeString(input: string): boolean {
  if (typeof input !== 'string') {
    return false;
  }

  const dangerousPatterns = [
    /<script/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /data:text\/html/gi,
    /vbscript:/gi,
  ];

  return !dangerousPatterns.some((pattern) => pattern.test(input));
}

/**
 * Sanitiza un objeto de formulario recursivamente
 * @param data - Objeto a sanitizar
 * @param maxLength - Longitud máxima para strings (default: 500)
 * @returns Objeto sanitizado
 */
export function sanitizeFormData<T extends Record<string, any>>(
  data: T,
  maxLength: number = 500
): T {
  const sanitized = {} as T;

  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const value = data[key];

      if (typeof value === 'string') {
        sanitized[key] = sanitizeString(value, maxLength) as T[Extract<
          keyof T,
          string
        >];
      } else if (typeof value === 'number') {
        sanitized[key] = value as T[Extract<keyof T, string>];
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map((item: unknown) =>
          typeof item === 'string' ? sanitizeString(item, maxLength) : item
        ) as T[Extract<keyof T, string>];
      } else if (value && typeof value === 'object') {
        sanitized[key] = sanitizeFormData(value, maxLength) as T[Extract<
          keyof T,
          string
        >];
      } else {
        sanitized[key] = value;
      }
    }
  }

  return sanitized;
}

/**
 * Valida que una placa de vehículo tenga un formato válido
 * @param placa - Placa a validar
 * @returns true si es válida
 */
export function validatePlaca(placa: string): boolean {
  if (!placa || typeof placa !== 'string') {
    return false;
  }

  // Formato básico: letras y números, longitud entre 3 y 10 caracteres
  const placaRegex = /^[A-Z0-9-]{3,10}$/i;
  return placaRegex.test(placa.trim());
}

/**
 * Valida que un año esté en un rango razonable
 * @param anio - Año a validar
 * @returns true si es válido
 */
export function validateAnio(anio: number | string | undefined): boolean {
  if (anio === undefined || anio === null || anio === '') {
    return true; // Opcional
  }

  const num = typeof anio === 'string' ? Number(anio) : anio;
  if (!Number.isFinite(num)) {
    return false;
  }

  const añoActual = new Date().getFullYear();
  const añoMaximo = añoActual + 1; // Permitir hasta el próximo año
  const añoMinimo = 1900;

  return num >= añoMinimo && num <= añoMaximo;
}

/**
 * Obtiene el rango válido de años para vehículos
 * @returns Objeto con año mínimo y máximo
 */
export function getRangoAnios(): { min: number; max: number } {
  const añoActual = new Date().getFullYear();
  return {
    min: 1900,
    max: añoActual + 1,
  };
}

/**
 * Valida que un teléfono tenga un formato válido
 * @param telefono - Teléfono a validar
 * @param length - Longitud esperada (default: 8)
 * @returns true si es válido
 */
export function validateTelefono(
  telefono: string,
  length: number = 8
): boolean {
  if (!telefono || typeof telefono !== 'string') {
    return false;
  }

  const telefonoRegex = /^\d+$/;
  return telefonoRegex.test(telefono) && telefono.length === length;
}

/**
 * Limpia y valida un ID numérico
 * @param id - ID a validar
 * @returns ID válido o undefined
 */
export function sanitizeId(
  id: string | number | undefined | null
): number | undefined {
  if (id === undefined || id === null || id === '') {
    return undefined;
  }

  const num = typeof id === 'string' ? Number(id) : id;

  if (!Number.isFinite(num) || num <= 0) {
    return undefined;
  }

  return Math.floor(num);
}

/**
 * Escapa caracteres HTML especiales para prevenir XSS
 * @param text - Texto a escapar
 * @returns Texto escapado
 */
export function escapeHtml(text: string): string {
  if (typeof text !== 'string') {
    return '';
  }

  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };

  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Valida que no haya más de 2 letras consecutivas iguales en un texto
 * @param input - Texto a validar
 * @returns true si es válido (no tiene más de 2 letras consecutivas iguales), false en caso contrario
 */
export function validateNoRepeatedChars(input: string): boolean {
  if (!input || typeof input !== 'string') {
    return true; // Strings vacíos son válidos
  }

  // Convertir a minúsculas para comparación case-insensitive
  const lowerInput = input.toLowerCase();

  // Buscar secuencias de 3 o más caracteres iguales consecutivos
  // La expresión regular busca cualquier carácter seguido de 2 o más del mismo carácter
  const repeatedPattern = /(.)\1{2,}/;

  return !repeatedPattern.test(lowerInput);
}

/**
 * Sanitiza un string eliminando secuencias de más de 2 caracteres consecutivos iguales
 * @param input - Texto a sanitizar
 * @param maxLength - Longitud máxima permitida
 * @returns Texto sanitizado
 */
export function sanitizeStringNoRepeats(
  input: string,
  maxLength: number = 500
): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  let sanitized = input.trim();

  // Eliminar secuencias de más de 2 caracteres consecutivos iguales
  // Reemplazar 3 o más caracteres iguales con solo 2
  sanitized = sanitized.replace(/(.)\1{2,}/gi, (match) => {
    return match[0].repeat(2); // Mantener solo 2 caracteres
  });

  // Aplicar sanitización normal
  sanitized = sanitizeString(sanitized, maxLength);

  return sanitized;
}
