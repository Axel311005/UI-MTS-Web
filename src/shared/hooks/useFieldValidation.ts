/**
 * Hook para validación de campos individuales
 * Útil para validación en tiempo real mientras el usuario escribe
 */

import { useState, useCallback, useEffect } from 'react';
import type { ValidationResult } from '@/shared/utils/validation';

export interface UseFieldValidationOptions {
  validate: (value: string) => ValidationResult;
  sanitize?: (value: string) => string;
  validateOnChange?: boolean; // Validar mientras el usuario escribe
  validateOnBlur?: boolean; // Validar cuando pierde el foco
}

export interface UseFieldValidationReturn {
  value: string;
  error: string | undefined;
  isValid: boolean;
  setValue: (value: string) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleBlur: () => void;
  validateField: () => boolean;
  clearError: () => void;
}

/**
 * Hook para validación de un campo individual
 */
export function useFieldValidation(
  initialValue: string = '',
  options: UseFieldValidationOptions
): UseFieldValidationReturn {
  const { validate, sanitize, validateOnChange = false, validateOnBlur = true } = options;

  const [value, setValueState] = useState(initialValue);
  const [error, setError] = useState<string | undefined>(undefined);
  const [isValid, setIsValid] = useState(true);

  const performValidation = useCallback(
    (val: string): boolean => {
      // Sanitizar si hay función de sanitización
      const sanitized = sanitize ? sanitize(val) : val;

      // Validar
      const result = validate(sanitized);

      if (result.isValid) {
        setError(undefined);
        setIsValid(true);
        return true;
      } else {
        setError(result.error);
        setIsValid(false);
        return false;
      }
    },
    [validate, sanitize]
  );

  const setValue = useCallback(
    (newValue: string) => {
      // Sanitizar antes de establecer el valor
      const sanitized = sanitize ? sanitize(newValue) : newValue;
      setValueState(sanitized);

      // Validar si está habilitado
      if (validateOnChange) {
        performValidation(sanitized);
      } else {
        // Si no se valida en cambio, limpiar error
        setError(undefined);
        setIsValid(true);
      }
    },
    [sanitize, validateOnChange, performValidation]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValue(e.target.value);
    },
    [setValue]
  );

  const handleBlur = useCallback(() => {
    if (validateOnBlur) {
      performValidation(value);
    }
  }, [validateOnBlur, performValidation, value]);

  const validateField = useCallback(() => {
    return performValidation(value);
  }, [performValidation, value]);

  const clearError = useCallback(() => {
    setError(undefined);
    setIsValid(true);
  }, []);

  // Validar cuando cambia el valor inicial (útil para formularios editables)
  useEffect(() => {
    if (initialValue !== value) {
      setValueState(initialValue);
      if (validateOnChange) {
        performValidation(initialValue);
      }
    }
  }, [initialValue, validateOnChange, performValidation, value]);

  return {
    value,
    error,
    isValid,
    setValue,
    handleChange,
    handleBlur,
    validateField,
    clearError,
  };
}

