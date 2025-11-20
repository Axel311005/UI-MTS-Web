/**
 * Componente de mensaje de error accesible
 * Incluye ARIA labels y roles para mejor accesibilidad
 */

import { cn } from '@/shared/lib/utils';

interface ErrorMessageProps {
  message: string;
  fieldId?: string;
  className?: string;
}

/**
 * Componente para mostrar mensajes de error con accesibilidad
 */
export function ErrorMessage({ message, fieldId, className }: ErrorMessageProps) {
  const errorId = fieldId ? `${fieldId}-error` : undefined;

  return (
    <p
      id={errorId}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      className={cn('text-xs sm:text-sm text-destructive mt-1', className)}
    >
      {message}
    </p>
  );
}

