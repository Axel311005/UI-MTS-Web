import { Navigate, Outlet, useLocation } from 'react-router';
import { useEffect } from 'react';
import { useAuthStore } from '@/auth/store/auth.store';

export function ProtectedRoute() {
  const authStatus = useAuthStore((s) => s.authStatus);
  const allowed = useAuthStore((s) => s.hasAnyRole(['gerente', 'vendedor']));
  const location = useLocation();

  if (authStatus === 'checking') {
    return <div style={{ padding: 16 }} />;
  }

  const isAuthenticated = authStatus === 'authenticated';

  // If authenticated but with a disallowed role, notify and logout
  useEffect(() => {
    if (isAuthenticated && !allowed) {
      useAuthStore.getState().logout();
    }
  }, [isAuthenticated, allowed]);

  if (isAuthenticated && !allowed) {
    return <Navigate to="/auth/login" replace state={{ from: location }} />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
