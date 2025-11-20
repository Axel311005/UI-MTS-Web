/**
 * Hook para validación de formularios
 * Centraliza la lógica de validación y reduce duplicación de código
 */

import { useState, useCallback } from 'react';
import type { ValidationResult } from '@/shared/utils/validation';

export interface FieldValidation<T> {
  validate: (value: T) => ValidationResult;
  sanitize?: (value: T) => T;
}

export interface FormValidationConfig<T extends Record<string, unknown>> {
  fields: Partial<Record<keyof T, FieldValidation<T[keyof T]>>>;
}

export interface UseFormValidationReturn<T extends Record<string, unknown>> {
  errors: Partial<Record<keyof T, string>>;
  validateField: (field: keyof T, value: T[keyof T]) => boolean;
  validateForm: (values: T) => boolean;
  clearErrors: () => void;
  clearFieldError: (field: keyof T) => void;
  setFieldError: (field: keyof T, error: string) => void;
}

/**
 * Hook para manejar validación de formularios
 */
export function useFormValidation<T extends Record<string, unknown>>(
  config: FormValidationConfig<T>
): UseFormValidationReturn<T> {
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  const validateField = useCallback(
    (field: keyof T, value: T[keyof T]): boolean => {
      const fieldConfig = config.fields[field];
      if (!fieldConfig) {
        return true; // Si no hay configuración, el campo es válido
      }

      // Sanitizar si hay función de sanitización
      const sanitizedValue = fieldConfig.sanitize
        ? fieldConfig.sanitize(value)
        : value;

      // Validar
      const result = fieldConfig.validate(sanitizedValue);

      if (result.isValid) {
        // Limpiar error si existe
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
        return true;
      } else {
        // Establecer error
        setErrors((prev) => ({
          ...prev,
          [field]: result.error || 'Campo inválido',
        }));
        return false;
      }
    },
    [config]
  );

  const validateForm = useCallback(
    (values: T): boolean => {
      const newErrors: Partial<Record<keyof T, string>> = {};
      let isValid = true;

      // Validar todos los campos configurados
      for (const field in config.fields) {
        if (Object.prototype.hasOwnProperty.call(config.fields, field)) {
          const fieldConfig = config.fields[field];
          if (!fieldConfig) continue;

          // Sanitizar si hay función de sanitización
          const sanitizedValue = fieldConfig.sanitize
            ? fieldConfig.sanitize(values[field])
            : values[field];

          // Validar
          const result = fieldConfig.validate(sanitizedValue);

          if (!result.isValid) {
            newErrors[field] = result.error || 'Campo inválido';
            isValid = false;
          }
        }
      }

      setErrors(newErrors);
      return isValid;
    },
    [config]
  );

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const clearFieldError = useCallback((field: keyof T) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }));
  }, []);

  return {
    errors,
    validateField,
    validateForm,
    clearErrors,
    clearFieldError,
    setFieldError,
  };
}

