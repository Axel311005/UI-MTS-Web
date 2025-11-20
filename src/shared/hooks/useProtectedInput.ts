/**
 * Hook para proteger inputs contra manipulación directa del DOM
 * Detecta cambios directos al DOM y los sanitiza/valida automáticamente
 */

import { useEffect, useRef, useCallback } from 'react';
import { sanitizeText, validateText, VALIDATION_RULES } from '@/shared/utils/validation';

interface UseProtectedInputOptions {
  fieldId: string;
  currentValue: string;
  onValueChange: (value: string) => void;
  min?: number;
  max?: number;
  allowRepeats?: boolean;
  validationRules?: {
    min: number;
    max: number;
  };
}

/**
 * Hook que protege un input contra manipulación directa del DOM
 */
export function useProtectedInput({
  fieldId,
  currentValue,
  onValueChange,
  min,
  max,
  allowRepeats = false,
  validationRules,
}: UseProtectedInputOptions): void {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const lastValueRef = useRef<string>(currentValue);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Obtener reglas de validación
  const rules = validationRules || {
    min: min || VALIDATION_RULES.descripcion.min,
    max: max || VALIDATION_RULES.descripcion.max,
  };

  // Función para sanitizar y validar
  const sanitizeAndValidate = useCallback(
    (value: string): string => {
      // Sanitizar el valor
      const sanitized = sanitizeText(value, rules.min, rules.max, allowRepeats);

      // Validar
      const validation = validateText(sanitized, rules.min, rules.max, allowRepeats);

      // Si no es válido, devolver el último valor válido
      if (!validation.isValid) {
        return lastValueRef.current;
      }

      return sanitized;
    },
    [rules.min, rules.max, allowRepeats]
  );

  // Función para verificar y corregir el valor del input
  const checkAndCorrectValue = useCallback(() => {
    const input = document.getElementById(fieldId) as HTMLInputElement | HTMLTextAreaElement | null;
    if (!input) return;

    const domValue = input.value;
    const reactValue = currentValue;

    // Si el valor del DOM es diferente al de React, significa que fue manipulado
    if (domValue !== reactValue) {
      // Sanitizar y validar el valor del DOM
      const sanitized = sanitizeAndValidate(domValue);

      // Si el valor sanitizado es diferente al del DOM, corregirlo
      if (sanitized !== domValue) {
        input.value = sanitized;
        // Disparar evento input para que React lo detecte
        const event = new Event('input', { bubbles: true });
        input.dispatchEvent(event);
      }

      // Actualizar el estado de React si el valor sanitizado es válido
      if (sanitized !== reactValue && sanitized === sanitizeAndValidate(sanitized)) {
        onValueChange(sanitized);
        lastValueRef.current = sanitized;
      }
    } else {
      // Actualizar la referencia del último valor válido
      lastValueRef.current = reactValue;
    }
  }, [fieldId, currentValue, onValueChange, sanitizeAndValidate]);

  // Efecto para monitorear el input
  useEffect(() => {
    const input = document.getElementById(fieldId) as HTMLInputElement | HTMLTextAreaElement | null;
    if (!input) return;

    inputRef.current = input;

    // Interceptar el setter de value usando Object.defineProperty
    let internalValue = input.value;

    try {
      Object.defineProperty(input, 'value', {
        get: () => internalValue,
        set: (newValue: string) => {
          // Sanitizar antes de establecer
          const sanitized = sanitizeAndValidate(String(newValue));
          internalValue = sanitized;

          // Establecer el valor sanitizado en el DOM
          const descriptor = Object.getOwnPropertyDescriptor(
            HTMLInputElement.prototype,
            'value'
          );
          if (descriptor && descriptor.set) {
            descriptor.set.call(input, sanitized);
          }

          // Actualizar React
          if (sanitized !== currentValue) {
            onValueChange(sanitized);
            lastValueRef.current = sanitized;
          }

          // Disparar evento input
          const event = new Event('input', { bubbles: true });
          input.dispatchEvent(event);
        },
        configurable: true,
      });
    } catch (e) {
      // Si falla, usar polling como fallback
      console.warn('No se pudo interceptar el setter de value, usando polling');
    }

    // Monitorear cambios cada 500ms como fallback
    checkIntervalRef.current = setInterval(() => {
      checkAndCorrectValue();
    }, 500);

    // También monitorear eventos de input, change, paste, etc.
    const handleInput = (e: Event) => {
      const target = e.target as HTMLInputElement | HTMLTextAreaElement;
      if (target && target.value !== currentValue) {
        const sanitized = sanitizeAndValidate(target.value);
        if (sanitized !== target.value) {
          target.value = sanitized;
          onValueChange(sanitized);
          lastValueRef.current = sanitized;
        } else if (sanitized !== currentValue) {
          onValueChange(sanitized);
          lastValueRef.current = sanitized;
        }
      }
    };

    input.addEventListener('input', handleInput);
    input.addEventListener('change', handleInput);
    input.addEventListener('paste', handleInput);
    input.addEventListener('keyup', handleInput);

    // Cleanup
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
      input.removeEventListener('input', handleInput);
      input.removeEventListener('change', handleInput);
      input.removeEventListener('paste', handleInput);
      input.removeEventListener('keyup', handleInput);

      // Restaurar el setter original si es posible
      try {
        delete (input as any).value;
      } catch (e) {
        // Ignorar si no se puede restaurar
      }
    };
  }, [fieldId, currentValue, onValueChange, sanitizeAndValidate, checkAndCorrectValue]);

  // Actualizar referencia cuando cambia el valor
  useEffect(() => {
    lastValueRef.current = currentValue;
  }, [currentValue]);
}

