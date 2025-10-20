import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuthStore } from '@/auth/store/auth.store';

export function ProtectedRoute() {
  const authStatus = useAuthStore((s) => s.authStatus);
  const allowed = useAuthStore((s) => s.hasAnyRole(['gerente', 'vendedor']));
  const location = useLocation();

  const isAuthenticated = authStatus === 'authenticated';

  if (authStatus === 'checking') {
    return <div style={{ padding: 16 }} />;
  }

  if (isAuthenticated && !allowed) {
    // Redirect to login with reason, NotAuthenticatedRoute will handle messaging/log-out
    return (
      <Navigate
        to="/auth/login"
        replace
        state={{ from: location, reason: 'unauthorized' }}
      />
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
