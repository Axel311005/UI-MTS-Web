/**
 * Utilidades de seguridad para prevenir XSS, validar inputs y sanitizar datos
 */

import DOMPurify from 'dompurify';

/**
 * Sanitiza una cadena de texto usando DOMPurify (robusto contra XSS)
 * También detecta y bloquea patrones de SQL Injection
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

  // Detectar SQL Injection - si se detecta, eliminar el texto malicioso
  if (detectSQLInjection(sanitized)) {
    // Eliminar patrones SQL maliciosos
    sanitized = sanitized
      .replace(/(\bOR\b|\bAND\b)\s+['"]?\d+['"]?\s*=\s*['"]?\d+['"]?/gi, '')
      .replace(/\bUNION\s+SELECT\b/gi, '')
      .replace(/\bSELECT\s+.*\s+FROM\b/gi, '')
      .replace(/\bINSERT\s+INTO\b/gi, '')
      .replace(/\bUPDATE\s+.*\s+SET\b/gi, '')
      .replace(/\bDELETE\s+FROM\b/gi, '')
      .replace(/\bDROP\s+(TABLE|DATABASE)\b/gi, '')
      .replace(/\bEXEC\s*\(/gi, '')
      .replace(/\bEXECUTE\s*\(/gi, '')
      .replace(/;\s*(DROP|DELETE|UPDATE|INSERT)/gi, '')
      .replace(/--\s*$/gm, '') // Eliminar comentarios SQL
      .replace(/\/\*.*?\*\//gs, '') // Eliminar comentarios SQL multilínea
      .replace(/'/g, '') // Eliminar comillas simples (común en SQL Injection)
      .trim();
  }

  // Usar DOMPurify para sanitización robusta contra XSS
  // DOMPurify elimina scripts, event handlers, y otros vectores de ataque
  sanitized = DOMPurify.sanitize(sanitized, {
    ALLOWED_TAGS: [], // No permitir ningún tag HTML
    ALLOWED_ATTR: [], // No permitir ningún atributo
    KEEP_CONTENT: true, // Mantener el contenido de texto
  });

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
    min: 1990, // Desde 1990
    max: añoActual + 1, // Hasta año actual + 1
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
 * Valida un RUC (Registro Único de Contribuyente) con algoritmo de dígito verificador
 * Soporta formatos comunes de RUC en países latinoamericanos
 * @param ruc - RUC a validar
 * @returns true si es válido
 */
export function validateRUC(ruc: string): boolean {
  if (!ruc || typeof ruc !== 'string') {
    return false;
  }

  // Limpiar espacios y guiones
  const cleaned = ruc.trim().replace(/[-\s]/g, '');

  // Debe ser solo números y tener entre 10 y 14 dígitos
  if (!/^\d{10,14}$/.test(cleaned)) {
    return false;
  }

  // Algoritmo de validación de dígito verificador (algoritmo común para RUC)
  // Este es un algoritmo simplificado, puede necesitar ajustes según el país
  const digits = cleaned.split('').map(Number);
  const base = digits.slice(0, -1); // Todos excepto el último
  const checkDigit = digits[digits.length - 1]; // Último dígito

  // Pesos para el cálculo (varían según el país, aquí usamos un algoritmo común)
  const weights = [3, 2, 7, 6, 5, 4, 3, 2, 1, 1, 1, 1, 1];
  const weightsForLength = weights.slice(-base.length).reverse();

  let sum = 0;
  for (let i = 0; i < base.length; i++) {
    sum += base[i] * weightsForLength[i];
  }

  const remainder = sum % 11;
  const calculatedCheckDigit = remainder < 2 ? remainder : 11 - remainder;

  return calculatedCheckDigit === checkDigit;
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
 * Detecta patrones comunes de SQL Injection
 * @param input - Texto a validar
 * @returns true si contiene patrones de SQL Injection
 */
export function detectSQLInjection(input: string): boolean {
  if (!input || typeof input !== 'string') {
    return false;
  }

  const sqlPatterns = [
    // Patrones básicos de SQL Injection
    /(\bOR\b|\bAND\b)\s+['"]?\d+['"]?\s*=\s*['"]?\d+['"]?/gi,
    /\bUNION\s+SELECT\b/gi,
    /\bSELECT\s+.*\s+FROM\b/gi,
    /\bINSERT\s+INTO\b/gi,
    /\bUPDATE\s+.*\s+SET\b/gi,
    /\bDELETE\s+FROM\b/gi,
    /\bDROP\s+(TABLE|DATABASE)\b/gi,
    /\bEXEC\s*\(/gi,
    /\bEXECUTE\s*\(/gi,
    /;\s*(DROP|DELETE|UPDATE|INSERT)/gi,
    /--\s*$/gm, // Comentarios SQL
    /\/\*.*\*\//gs, // Comentarios SQL multilínea
    /'\s*OR\s*['"]?\d+['"]?\s*=\s*['"]?\d+['"]?/gi,
    /'\s*OR\s*'1'\s*=\s*'1/gi,
    /'\s*OR\s*'1'\s*=\s*'1'\s*--/gi,
    /'\s*OR\s*'1'\s*=\s*'1'\s*\/\*/gi,
    /admin'--/gi,
    /admin'\/\*/gi,
    /admin'#/gi,
    /'\s*UNION\s+SELECT\s+NULL/gi,
    /'\s*UNION\s+SELECT\s+NULL,\s*NULL/gi,
    /'\s*OR\s*1\s*=\s*1/gi,
    /'\s*OR\s*1\s*=\s*1\s*--/gi,
    /'\s*OR\s*1\s*=\s*1\s*\/\*/gi,
  ];

  return sqlPatterns.some((pattern) => pattern.test(input));
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
 * Sanitiza un nombre o apellido: solo letras (incluyendo acentos), sin espacios, números ni caracteres especiales
 * @param name - Nombre a sanitizar
 * @param minLength - Longitud mínima (default: 2)
 * @param maxLength - Longitud máxima (default: 30)
 * @returns Nombre sanitizado
 */
export function sanitizeName(
  name: string,
  minLength: number = 2,
  maxLength: number = 30
): string {
  if (typeof name !== 'string') {
    return '';
  }

  // Eliminar espacios, números y caracteres especiales
  // Solo permitir letras (incluyendo acentos y ñ)
  const sanitized = name
    .replace(/\s/g, '') // Eliminar espacios
    .replace(/[0-9]/g, '') // Eliminar números
    .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, '') // Solo letras y acentos
    .trim();

  // Limitar longitud máxima
  if (sanitized.length > maxLength) {
    return sanitized.slice(0, maxLength);
  }

  // Si es muy corto, devolver vacío (se validará después)
  if (sanitized.length < minLength) {
    return sanitized;
  }

  return sanitized;
}

/**
 * Valida un nombre o apellido sanitizado
 * @param name - Nombre a validar
 * @param minLength - Longitud mínima (default: 2)
 * @param maxLength - Longitud máxima (default: 30)
 * @returns Objeto con isValid y error opcional
 */
export function validateName(
  name: string,
  minLength: number = 2,
  maxLength: number = 30
): { isValid: boolean; error?: string } {
  if (!name || typeof name !== 'string') {
    return { isValid: false, error: 'El nombre es requerido' };
  }

  const sanitized = sanitizeName(name, minLength, maxLength);

  // Validar longitud mínima
  if (sanitized.length < minLength) {
    return {
      isValid: false,
      error: `El nombre debe tener al menos ${minLength} letras`,
    };
  }

  // Validar longitud máxima
  if (sanitized.length > maxLength) {
    return {
      isValid: false,
      error: `El nombre no puede tener más de ${maxLength} letras`,
    };
  }

  // Validar que no esté vacío después de sanitizar
  if (sanitized.trim().length === 0) {
    return { isValid: false, error: 'El nombre no puede estar vacío' };
  }

  // Validar que no tenga más de 2 caracteres repetidos consecutivos
  const repeatedPattern = /(.)\1{2,}/;
  if (repeatedPattern.test(sanitized.toLowerCase())) {
    return {
      isValid: false,
      error: 'El nombre no puede tener más de 2 letras iguales consecutivas',
    };
  }

  // Validar que no sea solo consonantes (sin vocales)
  const vowels = /[aeiouáéíóúAEIOUÁÉÍÓÚ]/;
  if (!vowels.test(sanitized)) {
    return {
      isValid: false,
      error: 'El nombre debe contener al menos una vocal',
    };
  }

  // Validar que no tenga demasiadas consonantes seguidas (más de 4)
  // Esto detecta basura como "bcdfgh" o "qwerty"
  if (sanitized.length > 5) {
    const consonantPattern = /[^aeiouáéíóúAEIOUÁÉÍÓÚ]{5,}/;
    if (consonantPattern.test(sanitized)) {
      return {
        isValid: false,
        error: 'El nombre contiene demasiadas consonantes seguidas sin vocales',
      };
    }
  }

  // Validar que no sea demasiado repetitivo (más del 40% del mismo carácter)
  // Esto detecta basura como "aaaaabbbbb" o "jjjjjkkkkk"
  if (sanitized.length >= 4) {
    const counts: Record<string, number> = {};
    for (const char of sanitized.toLowerCase()) {
      counts[char] = (counts[char] || 0) + 1;
    }
    const maxCount = Math.max(...Object.values(counts));
    const repetitivePercentage = (maxCount / sanitized.length) * 100;
    if (repetitivePercentage > 40) {
      return {
        isValid: false,
        error: 'El nombre contiene demasiadas letras repetidas',
      };
    }
  }

  return { isValid: true };
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
