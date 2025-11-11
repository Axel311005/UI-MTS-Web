import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
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
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  onReset: () => void;
}

function ErrorFallback({ onReset }: ErrorFallbackProps) {
  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-muted rounded-full">
              <AlertTriangle className="h-10 w-10 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold">
            Algo salió mal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-sm sm:text-base text-muted-foreground">
              Por favor, intenta recargar la página o regresar al inicio.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
            <Button
              onClick={onReset}
              variant="default"
              className="w-full sm:w-auto h-10 sm:h-11 text-sm sm:text-base touch-manipulation min-h-[44px]"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Intentar de nuevo
            </Button>
            <Button
              onClick={handleGoHome}
              variant="outline"
              className="w-full sm:w-auto h-10 sm:h-11 text-sm sm:text-base touch-manipulation min-h-[44px]"
            >
              <Home className="h-4 w-4 mr-2" />
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
  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-muted rounded-full">
              <AlertTriangle className="h-10 w-10 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold">
            Error al cargar la página
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-sm sm:text-base text-muted-foreground">
              Por favor, intenta recargar la página o regresar al inicio.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
            <Button
              onClick={() => window.location.reload()}
              variant="default"
              className="w-full sm:w-auto h-10 sm:h-11 text-sm sm:text-base touch-manipulation min-h-[44px]"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Recargar página
            </Button>
            <Button
              onClick={handleGoHome}
              variant="outline"
              className="w-full sm:w-auto h-10 sm:h-11 text-sm sm:text-base touch-manipulation min-h-[44px]"
            >
              <Home className="h-4 w-4 mr-2" />
              Ir al inicio
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

