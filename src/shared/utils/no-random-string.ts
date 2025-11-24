/**
 * Valida que una cadena no sea una cadena aleatoria sin sentido
 * Similar a @NoRandomString() del backend
 * 
 * Detecta:
 * - Patrones repetitivos (subcadenas que se repiten)
 * - Baja diversidad de caracteres
 * - Frecuencia excesiva de letras
 * - Secuencias muy largas de consonantes
 * - Ratio muy bajo de vocales
 */

export interface NoRandomStringResult {
  isValid: boolean;
  error?: string;
}

export function validateNoRandomString(value: string): NoRandomStringResult {
  if (value === null || value === undefined || value === '') {
    return { isValid: true };
  }

  if (typeof value !== 'string') {
    return { isValid: false, error: 'El valor debe ser una cadena de texto' };
  }

  const str = value.toLowerCase().trim();

  // Si es muy corto, no aplicar esta validación
  if (str.length < 8) {
    return { isValid: true };
  }

  // Contar vocales y consonantes
  const vowels = (str.match(/[aeiouáéíóú]/g) || []).length;
  const consonants = (str.match(/[bcdfghjklmnpqrstvwxyz]/g) || []).length;
  const totalLetters = vowels + consonants;

  // Si no hay suficientes letras, no aplicar
  if (totalLetters < 6) {
    return { isValid: true };
  }

  // Calcular ratio de vocales
  const vowelRatio = vowels / totalLetters;

  // Si tiene menos del 15% de vocales, probablemente es aleatorio
  if (vowelRatio < 0.15) {
    return {
      isValid: false,
      error: 'El valor parece ser una cadena aleatoria sin sentido. Por favor, ingrese un valor válido',
    };
  }

  // Detectar secuencias muy largas de consonantes (más de 5)
  const consonantSequence = /[bcdfghjklmnpqrstvwxyz]{6,}/gi;
  if (consonantSequence.test(str)) {
    return {
      isValid: false,
      error: 'El valor parece ser una cadena aleatoria sin sentido. Por favor, ingrese un valor válido',
    };
  }

  // Detectar patrones repetitivos
  // Si una subcadena de 4+ caracteres se repite 2+ veces, probablemente es aleatorio
  for (let patternLength = 4; patternLength <= Math.floor(str.length / 2); patternLength++) {
    for (let i = 0; i <= str.length - patternLength * 2; i++) {
      const pattern = str.substring(i, i + patternLength);
      const remaining = str.substring(i + patternLength);
      if (remaining.includes(pattern)) {
        // Si el patrón se repite, verificar si es muy repetitivo
        const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const occurrences = (str.match(new RegExp(escapedPattern, 'g')) || []).length;
        // Si el patrón aparece 3+ veces o representa más del 40% de la cadena, es sospechoso
        if (occurrences >= 3 || (patternLength * occurrences) / str.length > 0.4) {
          return {
            isValid: false,
            error: 'El valor parece ser una cadena aleatoria sin sentido. Por favor, ingrese un valor válido',
          };
        }
      }
    }
  }

  // Detectar baja diversidad de caracteres
  // Si hay muy pocos caracteres únicos comparado con la longitud, es sospechoso
  const uniqueChars = new Set(str.replace(/[^a-z]/g, '')).size;
  const uniqueRatio = uniqueChars / totalLetters;
  // Si tiene menos del 30% de caracteres únicos y es largo, probablemente es aleatorio
  if (str.length >= 15 && uniqueRatio < 0.3) {
    return {
      isValid: false,
      error: 'El valor parece ser una cadena aleatoria sin sentido. Por favor, ingrese un valor válido',
    };
  }

  // Detectar frecuencia excesiva de letras
  // Si alguna letra aparece más del 30% de las veces en cadenas largas
  const charCounts: { [key: string]: number } = {};
  for (const char of str.replace(/[^a-z]/g, '')) {
    charCounts[char] = (charCounts[char] || 0) + 1;
  }
  // Si alguna letra aparece más del 30% de las veces en cadenas largas
  if (str.length >= 15) {
    for (const count of Object.values(charCounts)) {
      if (count / totalLetters > 0.3) {
        return {
          isValid: false,
          error: 'El valor parece ser una cadena aleatoria sin sentido. Por favor, ingrese un valor válido',
        };
      }
    }
  }

  return { isValid: true };
}

