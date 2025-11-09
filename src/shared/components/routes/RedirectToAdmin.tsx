import { Navigate, useLocation } from 'react-router';

export function RedirectToAdmin() {
  const location = useLocation();
  const newPath = `/admin${location.pathname}`;
  return <Navigate to={newPath} replace />;
}

