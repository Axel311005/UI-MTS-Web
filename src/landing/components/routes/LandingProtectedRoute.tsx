import { Navigate, useLocation } from 'react-router';
import { useLandingAuthStore } from '../../store/landing-auth.store';
import { useAuthStore } from '@/auth/store/auth.store';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

interface LandingProtectedRouteProps {
  children: ReactNode;
}

export function LandingProtectedRoute({ children }: LandingProtectedRouteProps) {
  const { isAuthenticated, user, token } = useLandingAuthStore();
  const authStatus = useAuthStore((s) => s.authStatus);
  const hasPanelAccess = useAuthStore((s) => s.hasPanelAccess);
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  // Verificar token en localStorage como fallback
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('landing-user');
      
      // Si hay token pero el store no está autenticado, verificar
      if (storedToken && (!isAuthenticated || !user)) {
        try {
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            useLandingAuthStore.getState().setAuth(storedToken, parsedUser);
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
    const canAccessPanel = typeof hasPanelAccess === 'function' ? hasPanelAccess() : false;
    if (canAccessPanel) {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  // Verificar autenticación: del store o del localStorage como fallback
  const hasToken = token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
  const hasUser = user || (typeof window !== 'undefined' ? localStorage.getItem('landing-user') : null);
  const isActuallyAuthenticated = isAuthenticated || (!!hasToken && !!hasUser);

  // Si no está autenticado en landing, redirigir al login
  if (!isActuallyAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return <>{children}</>;
}

