import { Navigate, Outlet, useLocation } from 'react-router';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '@/auth/store/auth.store';
import { useLandingAuthStore } from '@/landing/store/landing-auth.store';

export function NotAuthenticatedRoute() {
  const authStatus = useAuthStore((s) => s.authStatus);
  const hasPanelAccess = useAuthStore((s) => s.hasPanelAccess);
  const { isAuthenticated: isLandingAuthenticated } = useLandingAuthStore();
  const location = useLocation();
  const logout = useAuthStore((s) => s.logout);
  const reason = (location.state as any)?.reason as string | undefined;

  // If we arrived here due to unauthorized access from ProtectedRoute
  useEffect(() => {
    if (reason === 'unauthorized') {
      toast.error(
        'Tu cuenta no tiene permisos para acceder al panel. Solo gerente, vendedor y superuser pueden acceder.'
      );
      logout();
    }
  }, [reason, logout]);

  if (authStatus === 'checking') {
    return <div style={{ padding: 16 }} />;
  }

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

  return <Outlet />;
}
