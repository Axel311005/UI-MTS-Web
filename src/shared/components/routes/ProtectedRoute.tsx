import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuthStore } from '@/auth/store/auth.store';
import { useLandingAuthStore } from '@/landing/store/landing-auth.store';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { AlertCircle, ShieldX } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useTokenExpirationCheck } from '@/shared/hooks/useTokenExpirationCheck';
import { isTokenExpired } from '@/shared/utils/tokenUtils';

export function ProtectedRoute() {
  const authStatus = useAuthStore((s) => s.authStatus);
  const hasPanelAccess = useAuthStore((s) => s.hasPanelAccess);
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const checkAuthStatus = useAuthStore((s) => s.checkAuthStatus);
  const logout = useAuthStore((s) => s.logout);
  const { isAuthenticated: isLandingAuthenticated } = useLandingAuthStore();
  const location = useLocation();

  // Verificar expiración del token periódicamente usando hook optimizado
  useTokenExpirationCheck({
    checkInterval: 60000, // 1 minuto
    checkImmediately: true,
    onExpired: () => {
      if (
        window.location.pathname !== '/login' &&
        window.location.pathname !== '/auth/login'
      ) {
        window.location.href = '/auth/login';
      }
    },
  });

  useEffect(() => {
    // Solo verificar si realmente es necesario (estado checking o no autenticado con token)
    const localToken = localStorage.getItem('token');
    
    // Si ya está autenticado y tiene datos, no hacer nada
    if (authStatus === 'authenticated' && user && token) {
      return;
    }

    // Si no hay token, no verificar
    if (!localToken) {
      return;
    }

    // Verificar si el token está vencido
    if (isTokenExpired(localToken)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      logout();
      return;
    }

    // Solo verificar con el servidor si está en estado 'checking' o no autenticado pero hay token
    if (authStatus === 'checking' || (authStatus === 'not-authenticated' && localToken)) {
      checkAuthStatus().catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        logout();
      });
    }
  }, [authStatus, user, token, checkAuthStatus, logout]);

  // Si está verificando, manejar según disponibilidad de datos
  // El store se inicializa desde localStorage, así que normalmente ya tenemos datos
  if (authStatus === 'checking') {
    const localToken = localStorage.getItem('token');
    // Si ya hay datos en el store, permitir acceso (verificación en segundo plano)
    if (user && token) {
      // Continuar con el flujo normal, la verificación se hace en segundo plano
      // No mostrar loading, ya tenemos datos del localStorage
    } else if (!localToken) {
      // No hay token, redirigir inmediatamente
      return <Navigate to="/auth/login" replace state={{ from: location }} />;
    } else {
      // Hay token pero aún no hay datos en el store (caso raro)
      // Redirigir al login
      return <Navigate to="/auth/login" replace state={{ from: location }} />;
    }
  }

  const isAuthenticated = authStatus === 'authenticated' && !!user;

  // Verificar acceso al panel
  const canAccessPanel = typeof hasPanelAccess === 'function' ? hasPanelAccess() : false;
  const isCliente = user?.cliente !== undefined && user?.cliente !== null;

  // Verificar si es empleado sin rol de acceso
  const roles = Array.isArray(user?.roles) ? user.roles.map((r) => String(r).toLowerCase()) : [];
  const isEmpleado = roles.includes('empleado');
  const hasAccessRole = roles.some(role => 
    ['gerente', 'vendedor', 'superuser'].includes(role)
  );
  const isEmpleadoSinAcceso = isEmpleado && !hasAccessRole;

  // Si está autenticado pero es cliente (no tiene acceso al panel), redirigir a landing
  if (isAuthenticated && isCliente && !canAccessPanel) {
    return <Navigate to="/" replace />;
  }

  // Si está autenticado en landing pero intenta acceder al panel, redirigir a landing
  if (isLandingAuthenticated && !canAccessPanel) {
    return <Navigate to="/" replace />;
  }

  // Si es empleado sin rol de acceso, mostrar mensaje personalizado
  if (isAuthenticated && isEmpleadoSinAcceso) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <Card className="w-full max-w-2xl border-destructive/50">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-destructive/10 rounded-full">
                <ShieldX className="h-12 w-12 text-destructive" />
              </div>
            </div>
            <CardTitle className="text-2xl md:text-3xl font-bold text-destructive">
              Acceso No Disponible
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <AlertCircle className="h-5 w-5" />
                <p className="text-lg font-medium">
                  Tu cuenta aún no tiene permisos para acceder al sistema
                </p>
              </div>
              <div className="bg-muted/50 rounded-lg p-6 space-y-3">
                <p className="text-base text-foreground">
                  Tu cuenta de empleado aún no se le ha asignado un rol (como vendedor) 
                  para poder acceder al sistema administrativo.
                </p>
                <p className="text-base text-foreground font-semibold">
                  Por favor, contacta con el taller para que te asignen los permisos necesarios.
                </p>
              </div>
            </div>
            <div className="flex justify-center">
              <Button
                onClick={() => {
                  logout();
                  window.location.href = '/';
                }}
                variant="default"
                className="min-w-[200px]"
              >
                Volver al Inicio
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Si está autenticado pero no tiene acceso al panel (y no es cliente ni empleado), redirigir a login
  if (isAuthenticated && !canAccessPanel) {
    return (
      <Navigate
        to="/auth/login"
        replace
        state={{ from: location, reason: 'unauthorized' }}
      />
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
