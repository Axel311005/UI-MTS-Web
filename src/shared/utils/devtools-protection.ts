/**
 * Protección básica contra DevTools (solo en producción)
 * NOTA: Esto es una medida básica, no es 100% efectiva
 * pero ayuda a disuadir a usuarios casuales
 */

// Tipos para console methods
type ConsoleMethodNames =
  | 'info'
  | 'debug'
  | 'trace'
  | 'table'
  | 'group'
  | 'groupEnd'
  | 'error'
  | 'warn'
  | 'assert'
  | 'clear'
  | 'count'
  | 'countReset'
  | 'dir'
  | 'dirxml'
  | 'profile'
  | 'profileEnd'
  | 'time'
  | 'timeEnd'
  | 'timeLog';

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
  const noop = (): void => {};
  const methods: ConsoleMethodNames[] = [
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
      const consoleObj = window.console as Console & Record<string, unknown>;
      if (consoleObj && consoleObj[method]) {
        consoleObj[method] = noop;
        // Intentar hacerlo no configurable para evitar que scripts externos lo sobrescriban
        try {
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
  const originalAddEventListener = window.addEventListener.bind(window);
  window.addEventListener = function (
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | AddEventListenerOptions
  ) {
    if ((type === 'error' || type === 'unhandledrejection') && listener) {
      // Interceptar el listener para evitar que muestre errores
      const wrappedListener: EventListener = function (event: Event) {
        try {
          if (listener) {
            if (typeof listener === 'function') {
              listener(event);
            } else if ('handleEvent' in listener) {
              listener.handleEvent(event);
            }
          }
        } catch (e) {
          // Silenciar cualquier error
        }
        // Prevenir el comportamiento por defecto
        if (
          event &&
          'preventDefault' in event &&
          typeof event.preventDefault === 'function'
        ) {
          event.preventDefault();
        }
        return false;
      };
      return originalAddEventListener(type, wrappedListener, options);
    }
    if (listener) {
      return originalAddEventListener(type, listener, options);
    }
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
    const consoleObj = window.console as Console;
    const originalLog = consoleObj.log.bind(consoleObj);

    const logWrapper = function (): void {
      // Mostrar el mensaje de advertencia solo la primera vez
      const windowWithFlag = window as Window & {
        __securityWarningShown?: boolean;
      };
      if (!windowWithFlag.__securityWarningShown) {
        const style = `
          color: red;
          font-size: 20px;
          font-weight: bold;
          -webkit-text-stroke: 1px black;
        `;
        originalLog('%c¡Detente!', style);
        originalLog(
          'Esta función del navegador está pensada para desarrolladores. Si alguien te indicó que copiaras y pegaras algo aquí para habilitar una función o para "hackear" la cuenta de alguien, se trata de un fraude. Si lo haces, esta persona podrá acceder a tu cuenta.'
        );
        windowWithFlag.__securityWarningShown = true;
      }
      // Después de mostrar el mensaje, bloquear todos los console.log
      return;
    };

    consoleObj.log = logWrapper;
  } catch (e) {
    // Si falla, continuar
  }

  // Deshabilitar console (esto ya incluye error y warn)
  // Esto se ejecuta después del mensaje para bloquear todo lo demás
  disableConsoleInProduction();

  // Bloquear console.log después de mostrar el mensaje de advertencia
  try {
    const consoleObj = window.console as Console;
    if (consoleObj && consoleObj.log) {
      const noop = (): void => {};
      consoleObj.log = noop;
      try {
        Object.defineProperty(window.console, 'log', {
          value: noop,
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
    const consoleObj = window.console as Console;
    if (consoleObj) {
      const noop = (): void => {};
      consoleObj.error = noop;
      consoleObj.warn = noop;
      // Intentar hacerlos no configurables
      try {
        Object.defineProperty(window.console, 'error', {
          value: noop,
          writable: false,
          configurable: false,
        });
        Object.defineProperty(window.console, 'warn', {
          value: noop,
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

/**
 * Observador para detectar intentos de restaurar console
 * Usa MutationObserver en lugar de setInterval para mejor performance
 */
let protectionObserver: MutationObserver | null = null;

/**
 * Inicializa protección mejorada usando MutationObserver
 * Reemplaza el setInterval por un enfoque más eficiente
 */
export function initDevToolsProtectionAdvanced(): void {
  if (import.meta.env.DEV) {
    return; // No proteger en desarrollo
  }

  // Ejecutar protección inicial
  initDevToolsProtection();

  // Usar MutationObserver para detectar cambios en el DOM que puedan indicar
  // intentos de restaurar console (aunque esto es raro, es más eficiente que setInterval)
  if (typeof MutationObserver !== 'undefined') {
    protectionObserver = new MutationObserver(() => {
      // Verificar periódicamente si console fue restaurado (pero menos frecuente)
      // Solo verificar métodos críticos
      const consoleObj = window.console as Console;
      if (consoleObj.log && consoleObj.log.toString().includes('native code')) {
        // Si detectamos que console.log fue restaurado, bloquearlo de nuevo
        initDevToolsProtection();
      }
    });

    // Observar cambios en el documento (aunque esto es principalmente para
    // detectar scripts inyectados, no para restaurar console)
    protectionObserver.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  }

  // También usar un timeout más largo en lugar de setInterval constante
  // Verificar cada 30 segundos en lugar de cada 5 segundos
  const checkInterval = setInterval(() => {
    initDevToolsProtection();
  }, 30000); // 30 segundos en lugar de 5

  // Limpiar cuando la página se descarga
  window.addEventListener('beforeunload', () => {
    if (protectionObserver) {
      protectionObserver.disconnect();
    }
    clearInterval(checkInterval);
  });
}
