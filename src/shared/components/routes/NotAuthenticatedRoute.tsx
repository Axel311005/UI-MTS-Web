import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuthStore } from '@/auth/store/auth.store';

export function NotAuthenticatedRoute() {
  const authStatus = useAuthStore((s) => s.authStatus);
  const location = useLocation();

  if (authStatus === 'authenticated') {
    const from = (location.state as any)?.from?.pathname || '/facturas';
    return <Navigate to={from} replace />;
  }

  return <Outlet />;
}
