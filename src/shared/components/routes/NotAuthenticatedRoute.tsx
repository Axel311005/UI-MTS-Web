import { Navigate, Outlet, useLocation } from 'react-router';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '@/auth/store/auth.store';

export function NotAuthenticatedRoute() {
  const authStatus = useAuthStore((s) => s.authStatus);
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

  if (authStatus === 'authenticated') {
    const from = (location.state as any)?.from?.pathname || '/facturas';
    return <Navigate to={from} replace />;
  }

  return <Outlet />;
}
