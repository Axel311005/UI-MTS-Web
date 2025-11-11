import { Navigate, useLocation } from 'react-router';
import { useLandingAuthStore } from '../../store/landing-auth.store';
import { useAuthStore } from '@/auth/store/auth.store';
import type { ReactNode } from 'react';

interface LandingNotAuthenticatedRouteProps {
  children: ReactNode;
}

export function LandingNotAuthenticatedRoute({ children }: LandingNotAuthenticatedRouteProps) {
  const { isAuthenticated: isLandingAuthenticated } = useLandingAuthStore();
  const authStatus = useAuthStore((s) => s.authStatus);
  const hasPanelAccess = useAuthStore((s) => s.hasPanelAccess);
  const location = useLocation();

  // Si está autenticado en el panel admin, redirigir al panel
  if (authStatus === 'authenticated') {
    const canAccessPanel = typeof hasPanelAccess === 'function' ? hasPanelAccess() : false;
    if (canAccessPanel) {
      const from = (location.state as any)?.from?.pathname || '/admin/dashboard';
      return <Navigate to={from} replace />;
    }
  }

  // Si está autenticado en landing, redirigir a landing
  if (isLandingAuthenticated) {
    const from = (location.state as any)?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
}

