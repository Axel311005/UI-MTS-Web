import type { ReactNode } from 'react';
import { escapeHtml } from '../utils/security';

interface SafeHTMLProps {
  /**
   * Contenido HTML a renderizar de forma segura
   * Si es string, se escapará automáticamente
   * Si es ReactNode, se renderizará normalmente (ya está seguro en React)
   */
  content: string | ReactNode;
  /**
   * Si es true, renderiza como HTML (usar con precaución y solo con contenido confiable)
   * Por defecto es false para prevenir XSS
   */
  asHTML?: boolean;
  /**
   * Clase CSS adicional
   */
  className?: string;
}

/**
 * Componente para renderizar contenido HTML de forma segura
 * Previene ataques XSS escapando automáticamente el contenido
 *
 * @example
 * // Uso seguro (recomendado)
 * <SafeHTML content={userInput} />
 *
 * // Uso con HTML confiable (solo si es absolutamente necesario)
 * <SafeHTML content={trustedHTML} asHTML={true} />
 */
export function SafeHTML({
  content,
  asHTML = false,
  className,
}: SafeHTMLProps) {
  // Si es ReactNode, React ya lo maneja de forma segura
  if (typeof content !== 'string') {
    return <span className={className}>{content}</span>;
  }

  // Si asHTML es true, renderizar como HTML (solo usar con contenido confiable)
  if (asHTML) {
    return (
      <span
        className={className}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  // Por defecto, escapar el contenido para prevenir XSS
  return <span className={className}>{escapeHtml(content)}</span>;
}
