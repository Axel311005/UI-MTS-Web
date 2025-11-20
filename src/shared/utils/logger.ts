/**
 * Sistema de logging estructurado para producción
 * Permite logging de errores sin exponer información sensible al usuario
 */

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 100; // Mantener solo los últimos 100 logs en memoria
  private isProduction = import.meta.env.PROD;

  /**
   * Envía logs a un servicio externo (Sentry, LogRocket, etc.)
   * Por ahora solo almacena en memoria, pero puede extenderse
   */
  private async sendToService(entry: LogEntry): Promise<void> {
    // En producción, aquí se enviaría a un servicio de logging
    // Ejemplo: Sentry.captureException, LogRocket.captureException, etc.

    if (this.isProduction) {
      // En producción, solo almacenar errores críticos
      if (entry.level === 'error') {
        // Aquí puedes integrar con Sentry, LogRocket, etc.
        // Por ahora solo lo guardamos en memoria
        this.logs.push(entry);

        // Limitar tamaño del array
        if (this.logs.length > this.maxLogs) {
          this.logs.shift();
        }
      }
    } else {
      // En desarrollo, mostrar en consola
      const consoleMethod = console[entry.level] || console.log;
      consoleMethod(
        `[${entry.level.toUpperCase()}]`,
        entry.message,
        entry.context || ''
      );
      if (entry.error) {
        console.error(entry.error);
      }
    }
  }

  /**
   * Crea una entrada de log
   */
  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    error?: Error
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: context ? this.sanitizeContext(context) : undefined,
      error: error
        ? {
            name: error.name,
            message: error.message,
            stack: this.isProduction ? undefined : error.stack, // No exponer stack en producción
          }
        : undefined,
    };
  }

  /**
   * Sanitiza el contexto para no exponer información sensible
   */
  private sanitizeContext(
    context: Record<string, unknown>
  ): Record<string, unknown> {
    const sanitized: Record<string, unknown> = {};
    const sensitiveKeys = [
      'password',
      'token',
      'secret',
      'key',
      'auth',
      'credential',
    ];

    for (const [key, value] of Object.entries(context)) {
      const lowerKey = key.toLowerCase();
      if (sensitiveKeys.some((sensitive) => lowerKey.includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Log de error
   */
  error(
    message: string,
    error?: Error,
    context?: Record<string, unknown>
  ): void {
    const entry = this.createLogEntry('error', message, context, error);
    this.sendToService(entry);
  }

  /**
   * Log de advertencia
   */
  warn(message: string, context?: Record<string, unknown>): void {
    const entry = this.createLogEntry('warn', message, context);
    this.sendToService(entry);
  }

  /**
   * Log de información
   */
  info(message: string, context?: Record<string, unknown>): void {
    const entry = this.createLogEntry('info', message, context);
    this.sendToService(entry);
  }

  /**
   * Log de debug (solo en desarrollo)
   */
  debug(message: string, context?: Record<string, unknown>): void {
    if (!this.isProduction) {
      const entry = this.createLogEntry('debug', message, context);
      this.sendToService(entry);
    }
  }

  /**
   * Obtiene los logs almacenados (útil para debugging)
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Limpia los logs almacenados
   */
  clearLogs(): void {
    this.logs = [];
  }
}

// Instancia singleton
export const logger = new Logger();
