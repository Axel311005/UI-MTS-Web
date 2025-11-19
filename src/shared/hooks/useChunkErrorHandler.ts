import { useEffect } from 'react';

/**
 * Hook para manejar errores de carga de chunks dinámicos.
 * Cuando un chunk no se puede cargar (porque fue actualizado en un nuevo deploy),
 * fuerza una recarga completa de la página para obtener el HTML actualizado.
 */
export function useChunkErrorHandler() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const error = event.error || event.message;
      
      // Detectar errores de módulos dinámicos
      if (
        error &&
        (typeof error === 'string' || error instanceof Error)
      ) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        // Detectar errores específicos de chunks
        if (
          errorMessage.includes('Failed to fetch dynamically imported module') ||
          errorMessage.includes('Failed to fetch') ||
          errorMessage.includes('Loading chunk') ||
          errorMessage.includes('Loading CSS chunk')
        ) {
          // Limpiar caché antes de recargar
          if ('caches' in window) {
            caches.keys().then((names) => {
              names.forEach((name) => {
                caches.delete(name);
              });
            });
          }
          
          // Recargar la página sin caché después de un breve delay
          // para evitar loops infinitos si el error persiste
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      }
    };

    // También capturar errores de promesas no manejadas (lazy loading)
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const errorMessage = reason instanceof Error ? reason.message : String(reason);
      
      if (
        errorMessage.includes('Failed to fetch dynamically imported module') ||
        errorMessage.includes('Failed to fetch') ||
        errorMessage.includes('Loading chunk')
      ) {
        event.preventDefault(); // Prevenir que se muestre en consola
        
        // Limpiar caché y recargar
        if ('caches' in window) {
          caches.keys().then((names) => {
            names.forEach((name) => {
              caches.delete(name);
            });
          });
        }
        
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);
}

