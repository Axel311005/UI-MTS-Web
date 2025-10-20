import { Navigate, Outlet } from 'react-router';
import { useAuthStore } from '@/auth/store/auth.store';

// Accept external roles including 'admin'; map to the store's roles
type ExternalRole = 'admin' | 'gerente' | 'vendedor';

export function RoleGuard({ allow }: { allow: ExternalRole[] }) {
  // Map 'admin' -> 'gerente' for compatibility with current store roles
  const mapped = allow.map((r) => (r === 'admin' ? 'gerente' : r)) as (
    | 'gerente'
    | 'vendedor'
  )[];

  const isAllowed = useAuthStore.getState().hasAnyRole(mapped);

  if (!isAllowed) {
    return <Navigate to="/facturas" replace />;
  }

  return <Outlet />;
}
