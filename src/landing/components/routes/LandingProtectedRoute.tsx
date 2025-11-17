import { Navigate, useLocation } from 'react-router';
import { useLandingAuthStore } from '../../store/landing-auth.store';
import { useAuthStore } from '@/auth/store/auth.store';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

interface LandingProtectedRouteProps {
  children: ReactNode;
}

export function LandingProtectedRoute({
  children,
}: LandingProtectedRouteProps) {
  const {
    isAuthenticated: landingIsAuthenticated,
    user: landingUser,
    token: landingToken,
  } = useLandingAuthStore();
  const authUser = useAuthStore((s) => s.user);
  const authToken = useAuthStore((s) => s.token);
  const authStatus = useAuthStore((s) => s.authStatus);
  const hasPanelAccess = useAuthStore((s) => s.hasPanelAccess);
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  // Obtener usuario desde landingUser o desde authUser como fallback
  const user =
    landingUser ||
    (authUser?.cliente
      ? {
          id: Number(authUser.id) || 0,
          email: authUser.email || '',
          clienteId: authUser.cliente.id || authUser.cliente.idCliente || 0,
          nombre:
            authUser.cliente.nombreCompleto ||
            (authUser.cliente.primerNombre
              ? `${authUser.cliente.primerNombre} ${
                  authUser.cliente.primerApellido || ''
                }`.trim()
              : null) ||
            authUser.cliente.ruc ||
            'Cliente',
        }
      : null);

  const token = landingToken || authToken;
  const isAuthenticated =
    landingIsAuthenticated || (!!authUser?.cliente && !!authToken);

  // Verificar token en localStorage como fallback
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token');
      const storedLandingUser = localStorage.getItem('landing-user');
      const storedUser = localStorage.getItem('user');

      // Si hay token pero el store no está autenticado, verificar
      if (storedToken && (!isAuthenticated || !user)) {
        try {
          // Primero intentar landing-user
          if (storedLandingUser) {
            const parsedUser = JSON.parse(storedLandingUser);
            useLandingAuthStore.getState().setAuth(storedToken, parsedUser);
          }
          // Si no hay landing-user pero hay user (del panel) y es cliente, sincronizar
          else if (storedUser) {
            const parsedAuthUser = JSON.parse(storedUser);
            if (parsedAuthUser?.cliente) {
              const cliente = parsedAuthUser.cliente as {
                id?: number;
                idCliente?: number;
                nombreCompleto?: string;
                primerNombre?: string;
                primerApellido?: string;
                ruc?: string;
              };
              const clienteId = cliente.id || cliente.idCliente || 0;
              const clienteNombre =
                cliente.nombreCompleto ||
                (cliente.primerNombre
                  ? `${cliente.primerNombre} ${
                      cliente.primerApellido || ''
                    }`.trim()
                  : null) ||
                cliente.ruc ||
                'Cliente';

              useLandingAuthStore.getState().setAuth(storedToken, {
                id: Number(parsedAuthUser.id) || 0,
                email: parsedAuthUser.email || '',
                clienteId: clienteId,
                nombre: clienteNombre,
              });
            }
          }
        } catch {
          // Si hay error, limpiar
          localStorage.removeItem('token');
          localStorage.removeItem('landing-user');
        }
      }
      setIsChecking(false);
    }
  }, [isAuthenticated, user]);

  // Si está verificando, mostrar loading
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si está autenticado en el panel (gerente, vendedor, superuser), redirigir al panel
  if (authStatus === 'authenticated') {
    const canAccessPanel =
      typeof hasPanelAccess === 'function' ? hasPanelAccess() : false;
    if (canAccessPanel) {
      return <Navigate to="/admin/home" replace />;
    }
  }

  // Verificar autenticación: del store o del localStorage como fallback
  const hasToken =
    token ||
    (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
  const hasUser =
    user ||
    (typeof window !== 'undefined'
      ? localStorage.getItem('landing-user') || localStorage.getItem('user')
      : null);
  const isActuallyAuthenticated = isAuthenticated || (!!hasToken && !!hasUser);

  // Si no está autenticado en landing, redirigir al login
  if (!isActuallyAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
