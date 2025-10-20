import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router';
import LoginPage from '@/auth/pages/LoginPage';
import { AppLayout } from '@/shared/components/layouts/AppLayout';
import { ProtectedRoute } from '@/shared/components/routes/ProtectedRoute';
import { NotAuthenticatedRoute } from '@/shared/components/routes/NotAuthenticatedRoute';
import { RoleGuard } from '@/shared/components/routes/RoleGuard';

// Lazy loaded pages
const FacturasPage = lazy(() =>
  import('@/facturas/pages/FacturasPage').then((m) => ({
    default: m.FacturasPage,
  }))
);

const ClientePage = lazy(() =>
  import('@/clientes/pages/ClientePage').then((m) => ({
    default: m.ClientesPage,
  }))
);

export const appRouter = createBrowserRouter([
  // Rutas de la app (protegidas)
  {
    element: <ProtectedRoute />, // protege todo debajo
    children: [
      {
        path: '/',
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/facturas" replace /> },
          {
            path: 'facturas',
            element: <FacturasPage />,
            handle: { crumb: 'Facturas' },
          },
          {
            path: 'facturas/search',
            element: <FacturasPage />,
            handle: { crumb: 'Buscar' },
          },
          {
            path: 'clientes',
            element: <ClientePage />,
            handle: { crumb: 'Clientes' },
          },
        ],
      },
      {
        path: '/admin',
        element: <RoleGuard allow={['admin', 'gerente']} />, // mapea 'admin' a 'gerente'
        children: [
          {
            element: <AppLayout />,
            children: [
              {
                path: 'facturas',
                element: <FacturasPage />,
                handle: { crumb: 'Facturas' },
              },
              {
                path: 'clientes',
                element: <ClientePage />,
                handle: { crumb: 'Clientes' },
              },
            ],
          },
        ],
      },
    ],
  },

  // Auth
  {
    path: '/auth',
    element: <NotAuthenticatedRoute />,
    children: [
      { index: true, element: <Navigate to="/auth/login" replace /> },
      { path: 'login', element: <LoginPage /> },
    ],
  },

  { path: '*', element: <Navigate to="/" replace /> },
]);
