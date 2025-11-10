import { Navigate, Outlet } from 'react-router';
import { useAuthStore } from '@/auth/store/auth.store';

import type { PanelRole } from '@/auth/store/auth.store';

export function RoleGuard({ allow }: { allow: PanelRole[] }) {
  const isAllowed = useAuthStore.getState().hasAnyRole(allow);

  if (!isAllowed) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Outlet />;
}
