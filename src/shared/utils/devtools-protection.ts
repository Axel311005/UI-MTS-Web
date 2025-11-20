/**
 * Protección básica contra DevTools (solo en producción)
 * NOTA: Esto es una medida básica, no es 100% efectiva
 * pero ayuda a disuadir a usuarios casuales
 */

/**
 * Deshabilita funciones de consola en producción
 * Nota: El build ya elimina console.log, esto es una capa adicional
 */
export function disableConsoleInProduction(): void {
  if (import.meta.env.DEV) {
    return; // No hacer nada en desarrollo
  }

  // Sobrescribir TODOS los console methods con funciones vacías
  // Esto incluye error y warn para evitar que se muestren errores en producción
  const noop = () => {};
  const methods = [
    // 'log' se maneja por separado en initDevToolsProtection para mostrar el mensaje primero
    'info',
    'debug',
    'trace',
    'table',
    'group',
    'groupEnd',
    'error', // Bloquear también errores
    'warn', // Bloquear también advertencias
    'assert',
    'clear',
    'count',
    'countReset',
    'dir',
    'dirxml',
    'profile',
    'profileEnd',
    'time',
    'timeEnd',
    'timeLog',
  ];

  methods.forEach((method) => {
    try {
      // @ts-ignore
      if (window.console && window.console[method]) {
        // @ts-ignore
        window.console[method] = noop;
        // Intentar hacerlo no configurable para evitar que scripts externos lo sobrescriban
        try {
          // @ts-ignore
          Object.defineProperty(window.console, method, {
            value: noop,
            writable: false,
            configurable: false,
          });
        } catch (e) {
          // Si falla, continuar con la sobrescritura normal
        }
      }
    } catch (e) {
      // Ignorar errores silenciosamente
    }
  });

  // Interceptar errores globales para evitar que se muestren en consola
  window.onerror = function () {
    // No hacer nada, solo prevenir que se muestre en consola
    return true; // Prevenir el comportamiento por defecto
  };

  // Interceptar promesas rechazadas no manejadas
  window.onunhandledrejection = function (event) {
    // Prevenir que se muestre en consola
    event.preventDefault();
    return true;
  };

  // Interceptar errores de addEventListener para evitar que se muestren
  const originalAddEventListener = window.addEventListener;
  window.addEventListener = function (
    type: string,
    listener: any,
    options?: any
  ) {
    if (type === 'error' || type === 'unhandledrejection') {
      // Interceptar el listener para evitar que muestre errores
      const wrappedListener = function (event: any) {
        try {
          if (listener) {
            listener(event);
          }
        } catch (e) {
          // Silenciar cualquier error
        }
        // Prevenir el comportamiento por defecto
        if (event && event.preventDefault) {
          event.preventDefault();
        }
        return false;
      };
      return originalAddEventListener.call(
        this,
        type,
        wrappedListener,
        options
      );
    }
    return originalAddEventListener.call(this, type, listener, options);
  };
}

/**
 * Protección básica contra inspección de código
 * Solo se ejecuta en producción
 */
export function initDevToolsProtection(): void {
  if (import.meta.env.DEV) {
    return; // No proteger en desarrollo
  }

  // Mostrar mensaje de advertencia similar a Facebook cuando alguien intenta usar la consola
  // Esto debe hacerse ANTES de bloquear console.log para que se muestre una vez
  try {
    // @ts-ignore
    const originalLog = window.console.log;
    // @ts-ignore
    window.console.log = function (...args: any[]) {
      // Mostrar el mensaje de advertencia solo la primera vez
      if (!(window as any).__securityWarningShown) {
        const style = `
          color: red;
          font-size: 20px;
          font-weight: bold;
          -webkit-text-stroke: 1px black;
        `;
        originalLog.call(console, '%c¡Detente!', style);
        originalLog.call(
          console,
          'Esta función del navegador está pensada para desarrolladores. Si alguien te indicó que copiaras y pegaras algo aquí para habilitar una función o para "hackear" la cuenta de alguien, se trata de un fraude. Si lo haces, esta persona podrá acceder a tu cuenta.'
        );
        (window as any).__securityWarningShown = true;
      }
      // Después de mostrar el mensaje, bloquear todos los console.log
      return;
    };
  } catch (e) {
    // Si falla, continuar
  }

  // Deshabilitar console (esto ya incluye error y warn)
  // Esto se ejecuta después del mensaje para bloquear todo lo demás
  disableConsoleInProduction();

  // Bloquear console.log después de mostrar el mensaje de advertencia
  try {
    // @ts-ignore
    if (window.console && window.console.log) {
      // @ts-ignore
      window.console.log = () => {};
      try {
        // @ts-ignore
        Object.defineProperty(window.console, 'log', {
          value: () => {},
          writable: false,
          configurable: false,
        });
      } catch (e) {
        // Si falla, continuar
      }
    }
  } catch (e) {
    // Ignorar si falla
  }

  // Asegurar que console.error y console.warn estén bloqueados
  // Esto es redundante pero asegura que estén bloqueados incluso si algo los restaura
  try {
    // @ts-ignore
    if (window.console) {
      // @ts-ignore
      window.console.error = () => {};
      // @ts-ignore
      window.console.warn = () => {};
      // Intentar hacerlos no configurables
      try {
        // @ts-ignore
        Object.defineProperty(window.console, 'error', {
          value: () => {},
          writable: false,
          configurable: false,
        });
        // @ts-ignore
        Object.defineProperty(window.console, 'warn', {
          value: () => {},
          writable: false,
          configurable: false,
        });
      } catch (e) {
        // Si falla, continuar
      }
    }
  } catch (e) {
    // Ignorar si falla
  }

  // No deshabilitar clic derecho para mejor UX

  // Deshabilitar atajos de teclado comunes para DevTools
  document.addEventListener('keydown', (e) => {
    // F12
    if (e.key === 'F12') {
      e.preventDefault();
      return false;
    }

    // Ctrl+Shift+I (DevTools)
    if (e.ctrlKey && e.shiftKey && e.key === 'I') {
      e.preventDefault();
      return false;
    }

    // Ctrl+Shift+J (Console)
    if (e.ctrlKey && e.shiftKey && e.key === 'J') {
      e.preventDefault();
      return false;
    }

    // Ctrl+U (View Source)
    if (e.ctrlKey && e.key === 'u') {
      e.preventDefault();
      return false;
    }

    // Ctrl+S (Save Page)
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      return false;
    }
  });

  // No bloquear DevTools completamente, solo deshabilitar console
  // Esto permite debugging si es necesario pero sin exponer información
}
