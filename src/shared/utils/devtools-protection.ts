/**
 * Protección avanzada contra DevTools y código JavaScript malicioso (solo en producción)
 * 
 * Esta protección se activa automáticamente en producción (Netlify, Vercel, etc.)
 * cuando import.meta.env.PROD es true (configurado por Vite automáticamente).
 * 
 * Protecciones implementadas:
 * - Bloquea eval() y Function() constructor (métodos comunes para ejecutar código malicioso)
 * - Bloquea setTimeout/setInterval con strings
 * - Protege contra scripts inyectados dinámicamente
 * - Protege innerHTML/outerHTML contra XSS
 * - Bloquea import() dinámico de orígenes no confiables
 * - Protege contra Proxy malicioso
 * - Bloquea Reflect.construct/apply con Function/eval
 * - Protege postMessage malicioso
 * - Protege contra Prototype Pollution
 * - Bloquea importScripts malicioso (Web Workers)
 * - Muestra mensaje de advertencia estilo Facebook/Instagram
 * - Bloquea acciones en la consola después de mostrar el mensaje
 * 
 * NOTA: Esto es una medida de seguridad, no es 100% efectiva contra atacantes avanzados
 * pero ayuda a disuadir a usuarios casuales y proteger contra scripts maliciosos comunes.
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

// Guardar referencia al console original antes de interceptarlo
let originalConsole: {
  log: typeof console.log;
  error?: typeof console.error;
  warn?: typeof console.warn;
  info?: typeof console.info;
  debug?: typeof console.debug;
} | null = null;

/**
 * Función para mostrar el mensaje de advertencia de Facebook/Instagram
 */
function showSecurityWarning(): void {
  const windowWithFlag = window as Window & {
    __securityWarningShown?: boolean;
  };
  
  if (windowWithFlag.__securityWarningShown) {
    return; // Ya se mostró el mensaje
  }

  try {
    // Usar el console original guardado para mostrar el mensaje
    const originalLog = originalConsole?.log || console.log.bind(console);
    
    const style = `
      color: red;
      font-size: 20px;
      font-weight: bold;
      -webkit-text-stroke: 1px black;
    `;
    originalLog('%c¡Detente!', style);
    originalLog(
      'Esta función del navegador está pensada para desarrolladores. Si alguien te indicó que copiaras y pegaras algo aquí para obtener funciones especiales o para "hackear" algo, se trata de una estafa. Si lo haces, esta persona podrá acceder a tu información personal y comprometer tu seguridad.'
    );
    windowWithFlag.__securityWarningShown = true;
  } catch (e) {
    // Si falla, continuar
  }
}

/**
 * Detecta si DevTools está abierto usando métodos que no dependen de console
 */
function detectDevTools(): void {
  try {
    // Método 1: Diferencia entre outerHeight e innerHeight
    const heightDiff = window.outerHeight - window.innerHeight;
    if (heightDiff > 200) {
      showSecurityWarning();
      return;
    }

    // Método 2: Diferencia entre outerWidth e innerWidth
    const widthDiff = window.outerWidth - window.innerWidth;
    if (widthDiff > 200) {
      showSecurityWarning();
      return;
    }

    // Método 3: Usar un getter para detectar cuando DevTools inspecciona
    // Esto funciona porque DevTools inspecciona propiedades cuando está abierto
    let devtoolsDetected = false;
    const element = new Image();
    Object.defineProperty(element, 'id', {
      get: function () {
        if (!devtoolsDetected) {
          devtoolsDetected = true;
          showSecurityWarning();
        }
        return '';
      },
    });
    
    // Intentar acceder a la propiedad (DevTools lo hará si está abierto)
    // Usar setTimeout para evitar bloqueos
    setTimeout(() => {
      try {
        // Esto solo se ejecutará si DevTools está inspeccionando
        void element.id;
      } catch (e) {
        // Ignorar errores
      }
    }, 0);
  } catch (e) {
    // Si falla, continuar
  }
}

/**
 * Protección contra ejecución de código JavaScript malicioso
 * Bloquea eval(), Function(), y otros métodos peligrosos
 */
function protectAgainstMaliciousCode(): void {
  if (import.meta.env.DEV) {
    return; // No proteger en desarrollo
  }

  try {
    // Bloquear eval() - método más común para ejecutar código malicioso
    window.eval = function (): never {
      showSecurityWarning();
      throw new Error('eval() está deshabilitado por seguridad');
    };

    // Intentar hacer eval no configurable
    try {
      Object.defineProperty(window, 'eval', {
        value: window.eval,
        writable: false,
        configurable: false,
      });
    } catch (e) {
      // Si falla, continuar
    }

    // Bloquear Function() constructor - otra forma común de ejecutar código
    window.Function = function (..._args: string[]): never {
      showSecurityWarning();
      throw new Error('Function() constructor está deshabilitado por seguridad');
    } as unknown as FunctionConstructor;

    // Intentar hacer Function no configurable
    try {
      Object.defineProperty(window, 'Function', {
        value: window.Function,
        writable: false,
        configurable: false,
      });
    } catch (e) {
      // Si falla, continuar
    }

    // Bloquear setTimeout/setInterval con strings (aunque ya no se usa mucho)
    const originalSetTimeout = window.setTimeout.bind(window);
    window.setTimeout = function (
      handler: TimerHandler,
      timeout?: number,
      ...args: any[]
    ) {
      if (typeof handler === 'string') {
        showSecurityWarning();
        throw new Error('setTimeout con string está deshabilitado por seguridad');
      }
      return originalSetTimeout(handler, timeout, ...args);
    } as typeof window.setTimeout;

    const originalSetInterval = window.setInterval.bind(window);
    window.setInterval = function (
      handler: TimerHandler,
      timeout?: number,
      ...args: any[]
    ) {
      if (typeof handler === 'string') {
        showSecurityWarning();
        throw new Error('setInterval con string está deshabilitado por seguridad');
      }
      return originalSetInterval(handler, timeout, ...args);
    } as typeof window.setInterval;

    // Proteger contra scripts inyectados dinámicamente - BLOQUEAR completamente
    const originalCreateElement = document.createElement.bind(document);
    document.createElement = function (tagName: string, options?: ElementCreationOptions): HTMLElement {
      const element = originalCreateElement(tagName, options);
      
      // Si es un script, BLOQUEAR su ejecución si no es de origen confiable
      if (tagName.toLowerCase() === 'script') {
        const originalSetAttribute = element.setAttribute.bind(element);
        const originalAppendChild = element.appendChild.bind(element);
        const originalInsertBefore = element.insertBefore.bind(element);
        
        element.setAttribute = function (name: string, value: string): void {
          if (name.toLowerCase() === 'src') {
            // Permitir SOLO scripts de origen confiable
            const isTrusted = value.startsWith('/') || 
                             value.startsWith(window.location.origin) ||
                             value.includes('cdn.') ||
                             value.includes('unpkg.') ||
                             value.includes('jsdelivr.');
            if (!isTrusted) {
              showSecurityWarning();
              // BLOQUEAR el script malicioso
              throw new Error('Scripts de origen no confiable están bloqueados por seguridad');
            }
          }
          originalSetAttribute(name, value);
        };

        // Bloquear appendChild para scripts maliciosos
        element.appendChild = function <T extends Node>(child: T): T {
          if (child.nodeType === Node.TEXT_NODE && child.textContent) {
            // Bloquear scripts inline maliciosos
            if (/<script|javascript:|eval\(|Function\(/i.test(child.textContent)) {
              showSecurityWarning();
              throw new Error('Scripts inline maliciosos están bloqueados');
            }
          }
          return originalAppendChild(child) as T;
        };

        element.insertBefore = function <T extends Node>(newNode: T, referenceNode: Node | null): T {
          if (newNode.nodeType === Node.TEXT_NODE && newNode.textContent) {
            if (/<script|javascript:|eval\(|Function\(/i.test(newNode.textContent)) {
              showSecurityWarning();
              throw new Error('Scripts inline maliciosos están bloqueados');
            }
          }
          return originalInsertBefore(newNode, referenceNode) as T;
        };
      }
      
      return element;
    };

    // Proteger innerHTML y outerHTML contra XSS - BLOQUEAR código malicioso
    const protectHTML = (target: any, prop: string): void => {
      const originalDescriptor = Object.getOwnPropertyDescriptor(
        Object.getPrototypeOf(target),
        prop
      );
      if (originalDescriptor) {
        Object.defineProperty(target, prop, {
          set: function (value: string) {
            // Detectar y BLOQUEAR intentos de inyección de scripts
            if (typeof value === 'string') {
              const maliciousPatterns = [
                /<script[\s>]/i,
                /javascript:/i,
                /on\w+\s*=/i, // onclick=, onerror=, etc.
                /eval\s*\(/i,
                /Function\s*\(/i,
                /<iframe/i,
                /<embed/i,
                /<object/i,
              ];
              
              const isMalicious = maliciousPatterns.some(pattern => pattern.test(value));
              
              if (isMalicious) {
                showSecurityWarning();
                // BLOQUEAR la inyección maliciosa
                console.error('Intento de inyección de código malicioso bloqueado');
                return; // No ejecutar el setter original
              }
            }
            if (originalDescriptor.set) {
              originalDescriptor.set.call(this, value);
            }
          },
          get: originalDescriptor.get,
          configurable: false,
        });
      }
    };

    // Aplicar protección a elementos comunes
    const elements = [HTMLElement.prototype, Element.prototype];
    elements.forEach((proto) => {
      try {
        protectHTML(proto, 'innerHTML');
        protectHTML(proto, 'outerHTML');
      } catch (e) {
        // Si falla, continuar
      }
    });

    // Bloquear WebAssembly malicioso
    if (typeof WebAssembly !== 'undefined') {
      WebAssembly.compile = function (_bufferSource: BufferSource): Promise<WebAssembly.Module> {
        showSecurityWarning();
        throw new Error('WebAssembly.compile está deshabilitado por seguridad');
      };

      WebAssembly.instantiate = function (
        _bufferSource: BufferSource | WebAssembly.Module,
        _importObject?: WebAssembly.Imports
      ): Promise<WebAssembly.Instance> {
        showSecurityWarning();
        throw new Error('WebAssembly.instantiate está deshabilitado por seguridad');
      } as typeof WebAssembly.instantiate;
    }

    // Proteger contra Blob URLs maliciosos
    const originalCreateObjectURL = URL.createObjectURL;
    URL.createObjectURL = function (object: Blob | MediaSource): string {
      // Permitir solo tipos seguros
      if (object instanceof Blob) {
        const allowedTypes = ['image/', 'video/', 'audio/', 'text/', 'application/json'];
        const isAllowed = allowedTypes.some(type => object.type.startsWith(type));
        if (!isAllowed && object.type.includes('javascript') || object.type.includes('script')) {
          showSecurityWarning();
          throw new Error('Blob URLs con contenido JavaScript están bloqueados');
        }
      }
      return originalCreateObjectURL(object);
    };

    // Proteger document.write (método antiguo pero aún peligroso)
    const originalWrite = document.write.bind(document);
    document.write = function (markup: string): void {
      if (typeof markup === 'string' && /<script|javascript:|eval\(|Function\(/i.test(markup)) {
        showSecurityWarning();
        throw new Error('document.write con código malicioso está bloqueado');
      }
      originalWrite(markup);
    };

    const originalWriteln = document.writeln.bind(document);
    document.writeln = function (markup: string): void {
      if (typeof markup === 'string' && /<script|javascript:|eval\(|Function\(/i.test(markup)) {
        showSecurityWarning();
        throw new Error('document.writeln con código malicioso está bloqueado');
      }
      originalWriteln(markup);
    };

    // Bloquear import() dinámico malicioso
    // Nota: import() es una función global, no una propiedad de window
    const globalImport = (globalThis as any).import;
    if (typeof globalImport === 'function') {
      (globalThis as any).import = function (specifier: string) {
        // Bloquear imports de orígenes no confiables
        const isTrusted = specifier.startsWith('/') || 
                         specifier.startsWith(window.location.origin) ||
                         specifier.includes('cdn.') ||
                         specifier.includes('unpkg.') ||
                         specifier.includes('jsdelivr.');
        if (!isTrusted) {
          showSecurityWarning();
          throw new Error('Import dinámico de origen no confiable bloqueado');
        }
        return globalImport(specifier);
      };
    }

    // Proteger contra Proxy malicioso
    const originalProxy = window.Proxy;
    if (originalProxy) {
      (window as any).Proxy = function (target: any, handler: ProxyHandler<any>) {
        // Detectar handlers maliciosos que intentan acceder a eval/Function
        if (handler && typeof handler.get === 'function') {
          const originalGet = handler.get;
          handler.get = function (proxyTarget, prop, receiver) {
            const propStr = String(prop);
            if (propStr === 'eval' || propStr === 'Function' || propStr === 'constructor') {
              showSecurityWarning();
              throw new Error('Proxy malicioso bloqueado: acceso a ' + propStr);
            }
            return originalGet(proxyTarget, prop, receiver);
          };
        }
        if (handler && typeof handler.construct === 'function') {
          const originalConstruct = handler.construct;
          handler.construct = function (proxyTarget, args, newTarget) {
            if (proxyTarget === Function || proxyTarget === eval) {
              showSecurityWarning();
              throw new Error('Proxy malicioso bloqueado: construct con Function/eval');
            }
            return originalConstruct(proxyTarget, args, newTarget);
          };
        }
        return new originalProxy(target, handler);
      };
    }

    // Bloquear Reflect malicioso
    if (typeof Reflect !== 'undefined') {
      const originalReflectConstruct = Reflect.construct;
      (Reflect as any).construct = function (target: any, argumentsList: ReadonlyArray<any>, newTarget?: any) {
        if (target === Function || target === eval || 
            (typeof target === 'function' && target.name === 'Function')) {
          showSecurityWarning();
          throw new Error('Reflect.construct con Function/eval bloqueado');
        }
        return originalReflectConstruct(target, argumentsList, newTarget);
      };

      // Proteger Reflect.apply con Function/eval
      const originalReflectApply = Reflect.apply;
      (Reflect as any).apply = function (target: any, thisArgument: any, argumentsList: ReadonlyArray<any>) {
        if (target === Function || target === eval) {
          showSecurityWarning();
          throw new Error('Reflect.apply con Function/eval bloqueado');
        }
        return originalReflectApply(target, thisArgument, argumentsList);
      };
    }

    // Proteger postMessage malicioso
    const originalPostMessage = window.postMessage.bind(window);
    // Usar función con sobrecarga para manejar ambos casos
    (window as any).postMessage = function (message: any, targetOriginOrOptions?: string | WindowPostMessageOptions, transfer?: Transferable[]) {
      // Manejar ambas sobrecargas de postMessage
      let targetOrigin: string;
      if (typeof targetOriginOrOptions === 'string') {
        targetOrigin = targetOriginOrOptions;
      } else if (targetOriginOrOptions && typeof targetOriginOrOptions === 'object') {
        targetOrigin = targetOriginOrOptions.targetOrigin || '*';
      } else {
        targetOrigin = '*';
      }
      
      // Validar origen - permitir solo mismo origen o wildcard controlado
      const currentOrigin = window.location.origin;
      const isAllowed = targetOrigin === '*' || 
                       targetOrigin === currentOrigin ||
                       targetOrigin.startsWith(currentOrigin);
      
      // Bloquear mensajes a orígenes externos sospechosos
      if (!isAllowed && targetOrigin !== '*') {
        // Permitir solo si el mensaje no contiene código ejecutable
        const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
        if (/eval|Function|script|javascript:/i.test(messageStr)) {
          showSecurityWarning();
          throw new Error('postMessage con código malicioso bloqueado');
        }
      }
      
      if (typeof targetOriginOrOptions === 'string') {
        return originalPostMessage(message, targetOriginOrOptions, transfer);
      } else if (targetOriginOrOptions) {
        return originalPostMessage(message, targetOriginOrOptions);
      } else {
        return originalPostMessage(message, '*');
      }
    };

    // Proteger contra Prototype Pollution
    const originalDefineProperty = Object.defineProperty;
    Object.defineProperty = function (obj: any, prop: string, descriptor: PropertyDescriptor) {
      const propStr = String(prop);
      // Bloquear modificaciones maliciosas a Object.prototype y Array.prototype
      if (obj === Object.prototype || obj === Array.prototype || 
          obj === Function.prototype || obj === String.prototype) {
        if (propStr === '__proto__' || propStr === 'constructor' || propStr === 'prototype') {
          showSecurityWarning();
          throw new Error('Prototype pollution bloqueado: modificación de ' + propStr);
        }
      }
      // Bloquear definición de propiedades peligrosas en window
      if (obj === window && (propStr === 'eval' || propStr === 'Function')) {
        showSecurityWarning();
        throw new Error('Modificación de ' + propStr + ' en window bloqueada');
      }
      return originalDefineProperty(obj, prop, descriptor);
    };

    // Proteger Object.setPrototypeOf
    const originalSetPrototypeOf = Object.setPrototypeOf;
    Object.setPrototypeOf = function (obj: any, prototype: any) {
      // Bloquear cambios de prototipo en objetos críticos
      if (obj === Object.prototype || obj === Array.prototype || 
          obj === Function.prototype || obj === window) {
        showSecurityWarning();
        throw new Error('setPrototypeOf en objeto crítico bloqueado');
      }
      return originalSetPrototypeOf(obj, prototype);
    };

    // Bloquear importScripts (si está disponible, para Web Workers)
    const globalImportScripts = (globalThis as any).importScripts;
    if (typeof globalImportScripts === 'function') {
      (globalThis as any).importScripts = function (...urls: string[]) {
        for (const url of urls) {
          const isTrusted = url.startsWith('/') || 
                          url.startsWith(window.location.origin) ||
                          url.includes('cdn.') ||
                          url.includes('unpkg.') ||
                          url.includes('jsdelivr.');
          if (!isTrusted) {
            showSecurityWarning();
            throw new Error('importScripts de origen no confiable bloqueado: ' + url);
          }
        }
        return globalImportScripts(...urls);
      };
    }

  } catch (e) {
    // Si falla, continuar sin protección adicional
  }
}

/**
 * Protección básica contra inspección de código
 * Solo se ejecuta en producción
 */
export function initDevToolsProtection(): void {
  if (import.meta.env.DEV) {
    return; // No proteger en desarrollo
  }

  // Primero proteger contra código malicioso
  protectAgainstMaliciousCode();

  // Guardar referencias originales del console ANTES de interceptarlo
  // Esto permite mostrar el mensaje usando el console original
  if (!originalConsole) {
    try {
      const consoleObj = window.console as Console;
      originalConsole = {
        log: consoleObj.log.bind(consoleObj),
        error: consoleObj.error?.bind(consoleObj),
        warn: consoleObj.warn?.bind(consoleObj),
        info: consoleObj.info?.bind(consoleObj),
        debug: consoleObj.debug?.bind(consoleObj),
      };
    } catch (e) {
      // Si falla, continuar sin guardar referencias
    }
  }

  // Mostrar mensaje de advertencia similar a Facebook cuando alguien intenta usar la consola
  // Esto debe hacerse ANTES de bloquear console.log para que se muestre una vez
  try {
    const consoleObj = window.console as Console;

    // Wrapper para todos los métodos de console que muestre el mensaje
    const consoleWrapper = function (): () => void {
      return function (): void {
        showSecurityWarning();
        // No ejecutar el método original, solo mostrar el mensaje y bloquear acciones
        return;
      };
    };

    // Interceptar todos los métodos principales de console
    consoleObj.log = consoleWrapper();
    if (originalConsole?.error) consoleObj.error = consoleWrapper();
    if (originalConsole?.warn) consoleObj.warn = consoleWrapper();
    if (originalConsole?.info) consoleObj.info = consoleWrapper();
    if (originalConsole?.debug) consoleObj.debug = consoleWrapper();
  } catch (e) {
    // Si falla, continuar
  }

  // Detectar apertura de DevTools periódicamente
  setInterval(() => {
    detectDevTools();
  }, 1000);

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
