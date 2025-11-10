import { Navigate, useLocation } from 'react-router';
import { useLandingAuthStore } from '../../store/landing-auth.store';
import { useAuthStore } from '@/auth/store/auth.store';
import type { ReactNode } from 'react';

interface LandingProtectedRouteProps {
  children: ReactNode;
}

export function LandingProtectedRoute({ children }: LandingProtectedRouteProps) {
  const { isAuthenticated } = useLandingAuthStore();
  const authStatus = useAuthStore((s) => s.authStatus);
  const hasPanelAccess = useAuthStore((s) => s.hasPanelAccess);
  const location = useLocation();

  // Si está autenticado en el panel (gerente, vendedor, superuser), redirigir al panel
  if (authStatus === 'authenticated') {
    const canAccessPanel = typeof hasPanelAccess === 'function' ? hasPanelAccess() : false;
    if (canAccessPanel) {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  // Si no está autenticado en landing, redirigir al login
  if (!isAuthenticated) {
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

