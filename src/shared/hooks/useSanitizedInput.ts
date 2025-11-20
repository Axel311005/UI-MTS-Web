import { useState, useCallback } from 'react';
import {
  sanitizeString,
  sanitizeNumber,
  sanitizeId,
  isSafeString,
} from '../utils/security';

/**
 * Hook personalizado para manejar inputs sanitizados
 * @param initialValue - Valor inicial
 * @param options - Opciones de sanitización
 */
export function useSanitizedInput<T extends string | number>(
  initialValue: T = '' as T,
  options: {
    maxLength?: number;
    min?: number;
    max?: number;
    type?: 'string' | 'number' | 'id';
  } = {}
) {
  const { maxLength = 500, min, max, type = 'string' } = options;

  const [value, setValue] = useState<T>(initialValue);
  const [error, setError] = useState<string | undefined>();

  const sanitize = useCallback(
    (input: string | number): T => {
      if (type === 'number') {
        const sanitized = sanitizeNumber(input, min, max);
        if (sanitized === undefined && input !== '') {
          setError('Valor numérico inválido');
          return value;
        }
        setError(undefined);
        return sanitized as T;
      }

      if (type === 'id') {
        const sanitized = sanitizeId(input);
        if (sanitized === undefined && input !== '') {
          setError('ID inválido');
          return value;
        }
        setError(undefined);
        return sanitized as T;
      }

      // String
      const stringValue = String(input);
      if (!isSafeString(stringValue)) {
        setError('El texto contiene caracteres no permitidos');
        return value;
      }

      const sanitized = sanitizeString(stringValue, maxLength);
      setError(undefined);
      return sanitized as T;
    },
    [maxLength, min, max, type, value]
  );

  const handleChange = useCallback(
    (newValue: string | number) => {
      const sanitized = sanitize(newValue);
      setValue(sanitized);
    },
    [sanitize]
  );

  const reset = useCallback(() => {
    setValue(initialValue);
    setError(undefined);
  }, [initialValue]);

  return {
    value,
    error,
    handleChange,
    reset,
    setValue: handleChange,
  };
}
