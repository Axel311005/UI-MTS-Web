/**
 * Validaciones inteligentes para reducir basura y código malicioso en inputs
 * Estas validaciones eliminan ~90% de basura típica sin afectar inputs normales
 */

/**
 * Resultado de una validación inteligente
 */
export interface SmartValidationResult {
  isValid: boolean;
  error?: string;
  reason?: 'repetitions' | 'no-vowels' | 'dangerous-chars' | 'too-short' | 'too-long' | 'repetitive' | 'noisy';
}

/**
 * Opciones de validación inteligente
 */
export interface SmartValidationOptions {
  minLength?: number;
  maxLength?: number;
  allowNumbers?: boolean;
  allowSpecialChars?: boolean;
  maxRepetitions?: number; // Máximo de caracteres iguales seguidos (default: 3)
  maxConsonantsInRow?: number; // Máximo de consonantes seguidas sin vocales (default: 4)
  maxRepetitivePercentage?: number; // Porcentaje máximo de caracteres repetidos (default: 50%)
  maxSymbolPercentage?: number; // Porcentaje máximo de símbolos (default: 20%)
  allowedChars?: RegExp; // Regex de caracteres permitidos
}

/**
 * Valida que no haya más de N caracteres iguales seguidos
 * @param text - Texto a validar
 * @param maxRepetitions - Máximo de repeticiones permitidas (default: 3)
 * @returns true si es válido
 */
export function validateNoExcessiveRepetitions(
  text: string,
  maxRepetitions: number = 3
): boolean {
  if (!text || typeof text !== 'string') {
    return true;
  }

  // Buscar secuencias de más de maxRepetitions caracteres iguales consecutivos
  // Ejemplo: (.)\1\1\1 busca 4 caracteres iguales seguidos
  const pattern = new RegExp(`(.)\\1{${maxRepetitions},}`, 'i');
  return !pattern.test(text);
}

/**
 * Valida que no haya demasiadas consonantes seguidas sin vocales
 * Los humanos casi nunca escriben palabras con más de 4-5 consonantes seguidas
 * @param text - Texto a validar
 * @param maxConsonants - Máximo de consonantes seguidas (default: 4)
 * @returns true si es válido
 */
export function validateNoExcessiveConsonants(
  text: string,
  maxConsonants: number = 4
): boolean {
  if (!text || typeof text !== 'string') {
    return true;
  }

  // Buscar secuencias de más de maxConsonants caracteres que no sean vocales
  const pattern = new RegExp(`[^aeiouáéíóúAEIOUÁÉÍÓÚ\\s\\d]{${maxConsonants + 1},}`, 'i');
  
  return !pattern.test(text);
}

/**
 * Detecta si un texto tiene un porcentaje muy alto de caracteres repetidos
 * @param text - Texto a validar
 * @param maxPercentage - Porcentaje máximo permitido (default: 50%)
 * @returns true si es válido (no es demasiado repetitivo)
 */
export function validateNotTooRepetitive(
  text: string,
  maxPercentage: number = 50
): boolean {
  if (!text || typeof text !== 'string' || text.length < 3) {
    return true; // Textos muy cortos no se validan
  }

  const counts: Record<string, number> = {};
  const cleanText = text.replace(/\s/g, ''); // Ignorar espacios

  if (cleanText.length === 0) {
    return true;
  }

  // Contar ocurrencias de cada carácter
  for (const char of cleanText.toLowerCase()) {
    counts[char] = (counts[char] || 0) + 1;
  }

  // Encontrar el carácter más repetido
  const maxCount = Math.max(...Object.values(counts));
  const percentage = (maxCount / cleanText.length) * 100;

  return percentage <= maxPercentage;
}

/**
 * Detecta si un input es "ruidoso" (tiene demasiados símbolos raros)
 * @param text - Texto a validar
 * @param maxSymbolPercentage - Porcentaje máximo de símbolos (default: 20%)
 * @param allowNumbers - Si se permiten números (default: true)
 * @returns true si es válido (no es demasiado ruidoso)
 */
export function validateNotTooNoisy(
  text: string,
  maxSymbolPercentage: number = 20,
  allowNumbers: boolean = true
): boolean {
  if (!text || typeof text !== 'string') {
    return true;
  }

  const totalChars = text.length;
  if (totalChars === 0) {
    return true;
  }

  // Contar símbolos (caracteres que no son letras ni números)
  let symbolCount = 0;
  for (const char of text) {
    if (!/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(char)) {
      if (allowNumbers && /[0-9]/.test(char)) {
        continue; // Los números no cuentan como símbolos si están permitidos
      }
      if (/\s/.test(char)) {
        continue; // Los espacios no cuentan como símbolos
      }
      symbolCount++;
    }
  }

  const percentage = (symbolCount / totalChars) * 100;
  return percentage <= maxSymbolPercentage;
}

/**
 * Valida que un texto solo contenga caracteres permitidos
 * @param text - Texto a validar
 * @param allowedPattern - Patrón regex de caracteres permitidos
 * @returns true si es válido
 */
export function validateAllowedChars(
  text: string,
  allowedPattern: RegExp
): boolean {
  if (!text || typeof text !== 'string') {
    return true;
  }

  // Verificar que todos los caracteres coincidan con el patrón permitido
  return allowedPattern.test(text);
}

/**
 * Validación inteligente completa que combina todas las técnicas
 * @param text - Texto a validar
 * @param options - Opciones de validación
 * @returns Resultado de la validación
 */
export function smartValidate(
  text: string,
  options: SmartValidationOptions = {}
): SmartValidationResult {
  const {
    minLength = 2,
    maxLength = 100,
    allowNumbers = true,
    allowSpecialChars = true,
    maxRepetitions = 3,
    maxConsonantsInRow = 4,
    maxRepetitivePercentage = 50,
    maxSymbolPercentage = 20,
    allowedChars,
  } = options;

  // Validar que sea string
  if (typeof text !== 'string') {
    return {
      isValid: false,
      error: 'El valor debe ser texto',
    };
  }

  const trimmed = text.trim();

  // 1. Validar longitud mínima
  if (trimmed.length < minLength) {
    return {
      isValid: false,
      error: `Debe tener al menos ${minLength} caracteres`,
      reason: 'too-short',
    };
  }

  // 2. Validar longitud máxima
  if (trimmed.length > maxLength) {
    return {
      isValid: false,
      error: `No puede tener más de ${maxLength} caracteres`,
      reason: 'too-long',
    };
  }

  // 3. Validar caracteres permitidos (si se especifica)
  if (allowedChars && !validateAllowedChars(trimmed, allowedChars)) {
    return {
      isValid: false,
      error: 'Contiene caracteres no permitidos',
      reason: 'dangerous-chars',
    };
  }

  // 4. Validar repeticiones excesivas
  if (!validateNoExcessiveRepetitions(trimmed, maxRepetitions)) {
    return {
      isValid: false,
      error: `No puede tener más de ${maxRepetitions} caracteres iguales seguidos`,
      reason: 'repetitions',
    };
  }

  // 5. Validar consonantes excesivas (solo para textos más largos)
  if (trimmed.length > 5 && !validateNoExcessiveConsonants(trimmed, maxConsonantsInRow)) {
    return {
      isValid: false,
      error: 'El texto contiene demasiadas consonantes seguidas sin vocales',
      reason: 'no-vowels',
    };
  }

  // 6. Validar que no sea demasiado repetitivo
  if (!validateNotTooRepetitive(trimmed, maxRepetitivePercentage)) {
    return {
      isValid: false,
      error: 'El texto es demasiado repetitivo',
      reason: 'repetitive',
    };
  }

  // 7. Validar que no sea demasiado "ruidoso" (muchos símbolos)
  if (!validateNotTooNoisy(trimmed, maxSymbolPercentage, allowNumbers)) {
    return {
      isValid: false,
      error: 'El texto contiene demasiados símbolos especiales',
      reason: 'noisy',
    };
  }

  // 8. Validar caracteres peligrosos básicos (si no se permiten caracteres especiales)
  if (!allowSpecialChars) {
    const dangerousChars = /[=<>'"%{}[\]`]/;
    if (dangerousChars.test(trimmed)) {
      return {
        isValid: false,
        error: 'Contiene caracteres no permitidos',
        reason: 'dangerous-chars',
      };
    }
  }

  return {
    isValid: true,
  };
}

/**
 * Validadores específicos para tipos comunes de campos
 */

/**
 * Valida un nombre (persona, lugar, etc.)
 */
export function validateName(name: string): SmartValidationResult {
  return smartValidate(name, {
    minLength: 2,
    maxLength: 100,
    allowNumbers: false,
    allowSpecialChars: false,
    maxRepetitions: 3,
    maxConsonantsInRow: 4,
    maxRepetitivePercentage: 40,
    maxSymbolPercentage: 5,
    allowedChars: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.,()-]+$/,
  });
}

/**
 * Valida una dirección
 * Más flexible que otras validaciones para permitir direcciones reales
 * como "Managua", "Ciudad Sandino, Zona 6", etc.
 */
export function validateAddress(address: string): SmartValidationResult {
  return smartValidate(address, {
    minLength: 5,
    maxLength: 200,
    allowNumbers: true,
    allowSpecialChars: true,
    maxRepetitions: 4, // Permite hasta 4 caracteres consecutivos iguales (ej: "Calle 1111")
    maxConsonantsInRow: 6, // Más permisivo para nombres de lugares
    maxRepetitivePercentage: 60, // Aumentado de 30 a 60 para permitir ciudades como "Managua" (42.86%)
    maxSymbolPercentage: 25, // Aumentado de 15 a 25 para permitir más comas, números, etc.
    allowedChars: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,#-]+$/, // Letras, números, espacios, comas, puntos, #, guiones
  });
}

/**
 * Valida una descripción o comentario
 */
export function validateDescription(description: string): SmartValidationResult {
  return smartValidate(description, {
    minLength: 2,
    maxLength: 500,
    allowNumbers: true,
    allowSpecialChars: true,
    maxRepetitions: 3,
    maxConsonantsInRow: 5,
    maxRepetitivePercentage: 35,
    maxSymbolPercentage: 25,
  });
}

/**
 * Valida un código o identificador
 */
export function validateCode(code: string): SmartValidationResult {
  return smartValidate(code, {
    minLength: 2,
    maxLength: 50,
    allowNumbers: true,
    allowSpecialChars: true,
    maxRepetitions: 3,
    maxConsonantsInRow: 6, // Los códigos pueden tener más consonantes
    maxRepetitivePercentage: 50,
    maxSymbolPercentage: 30,
    allowedChars: /^[a-zA-Z0-9\-_]+$/,
  });
}

/**
 * Valida una búsqueda (más permisiva)
 */
export function validateSearch(search: string): SmartValidationResult {
  return smartValidate(search, {
    minLength: 1,
    maxLength: 100,
    allowNumbers: true,
    allowSpecialChars: true,
    maxRepetitions: 4, // Más permisivo para búsquedas
    maxConsonantsInRow: 6,
    maxRepetitivePercentage: 60,
    maxSymbolPercentage: 30,
  });
}

