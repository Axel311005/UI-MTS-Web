import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundaryClass extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Update state with error details
    this.setState({
      error,
      errorInfo,
    });

    // Aquí podrías enviar el error a un servicio de logging en producción
    // Ejemplo: logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Si hay un fallback personalizado, usarlo
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Renderizar UI de error por defecto
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  onReset: () => void;
}

function ErrorFallback({ error, errorInfo, onReset }: ErrorFallbackProps) {
  const isDev = import.meta.env.DEV;

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-destructive/5 p-4">
      <Card className="w-full max-w-2xl border-destructive/50 shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-destructive/10 rounded-full">
              <AlertTriangle className="h-12 w-12 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-2xl md:text-3xl font-bold text-destructive">
            ¡Oops! Algo salió mal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              Lo sentimos, ha ocurrido un error inesperado. Por favor, intenta
              recargar la página o regresar al inicio.
            </p>
          </div>

          {isDev && error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 space-y-2">
              <p className="font-semibold text-sm text-destructive">
                Detalles del error (solo en desarrollo):
              </p>
              <pre className="text-xs overflow-auto max-h-48 bg-background p-2 rounded border">
                {error.toString()}
                {errorInfo?.componentStack && (
                  <>
                    {'\n\n'}
                    {errorInfo.componentStack}
                  </>
                )}
              </pre>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={onReset}
              variant="default"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Intentar de nuevo
            </Button>
            <Button
              onClick={handleGoHome}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Ir al inicio
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Hook wrapper para usar ErrorBoundary con hooks
export function ErrorBoundary({ children, fallback }: Props) {
  return <ErrorBoundaryClass fallback={fallback}>{children}</ErrorBoundaryClass>;
}

// Componente para usar como errorElement en React Router
// No puede usar hooks de React Router directamente, así que usamos window.location
export function RouterErrorBoundary() {
  const isDev = import.meta.env.DEV;

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-destructive/5 p-4">
      <Card className="w-full max-w-2xl border-destructive/50 shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-destructive/10 rounded-full">
              <AlertTriangle className="h-12 w-12 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-2xl md:text-3xl font-bold text-destructive">
            Error al cargar la página
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              No se pudo cargar esta página. Por favor, intenta recargar o
              regresar al inicio.
            </p>
          </div>

          {isDev && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 space-y-2">
              <p className="font-semibold text-sm text-destructive">
                Detalles del error (solo en desarrollo):
              </p>
              <p className="text-xs text-muted-foreground">
                Revisa la consola del navegador para más detalles.
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => window.location.reload()}
              variant="default"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Recargar página
            </Button>
            <Button
              onClick={handleGoHome}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Ir al inicio
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

