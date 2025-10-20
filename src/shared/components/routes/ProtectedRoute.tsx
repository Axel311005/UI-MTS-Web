import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuthStore } from '@/auth/store/auth.store';

export function ProtectedRoute() {
  const authStatus = useAuthStore((s) => s.authStatus);
  const location = useLocation();

  const isAuthenticated = authStatus === 'authenticated';
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
