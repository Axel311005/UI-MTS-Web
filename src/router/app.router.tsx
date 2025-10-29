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

const NuevaFacturaPage = lazy(() =>
  import('@/facturas/pages/NuevaFacturaPage').then((m) => ({
    default: m.default,
  }))
);

const EditarFacturaPage = lazy(() =>
  import('@/facturas/pages/EditarFacturaPage').then((m) => ({
    default: m.default,
  }))
);

const VerDetallesFacturaPage = lazy(() =>
  import('@/facturas/pages/VerDetallesFacturaPage').then((m) => ({
    default: m.default,
  }))
);

const ClientePage = lazy(() =>
  import('@/clientes/pages/ClientePage').then((m) => ({
    default: m.ClientesPage,
  }))
);

const NuevoClientePage = lazy(() =>
  import('@/clientes/pages/NuevoClientePage').then((m) => ({
    default: m.default,
  }))
);

const EditarClientePage = lazy(() =>
  import('@/clientes/pages/EditarClientePage').then((m) => ({
    default: m.default,
  }))
);

const VerDetallesClientePage = lazy(() =>
  import('@/clientes/pages/VerDetallesClientePage').then((m) => ({
    default: m.default,
  }))
);

const ItemPage = lazy(() =>
  import('@/items/pages/ItemPage').then((m) => ({
    default: m.ItemPage,
  }))
);
const EditarItemPage = lazy(() =>
  import('@/items/pages/EditarItemPage').then((m) => ({
    default: m.default,
  }))
);
const NuevoItemPage = lazy(() =>
  import('@/items/pages/NuevoItemPage').then((m) => ({
    default: m.default,
  }))
);
const VerDetallesItemPage = lazy(() =>
  import('@/items/pages/VerDetallesItemPage').then((m) => ({
    default: m.default,
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
            path: 'facturas/nueva',
            element: <NuevaFacturaPage />,
            handle: { crumb: 'Nueva factura' },
          },
          {
            path: 'facturas/:id/editar',
            element: <EditarFacturaPage />,
            handle: { crumb: 'Editar factura' },
          },
          {
            path: 'facturas/:id',
            element: <VerDetallesFacturaPage />,
            handle: { crumb: 'Factura' },
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
          {
            path: 'clientes/nuevo',
            element: <NuevoClientePage />,
            handle: { crumb: 'Nuevo cliente' },
          },
          {
            path: 'clientes/:id/editar',
            element: <EditarClientePage />,
            handle: { crumb: 'Editar cliente' },
          },
          {
            path: 'clientes/:id',
            element: <VerDetallesClientePage />,
            handle: { crumb: 'Cliente' },
          },
          {
            path: 'productos',
            element: <ItemPage />,
            handle: { crumb: 'Productos' },
          },
          {
            path: 'productos/nuevo',
            element: <NuevoItemPage />,
            handle: { crumb: 'Nuevo producto' },
          },
          {
            path: 'productos/:id',
            element: <VerDetallesItemPage />,
            handle: { crumb: 'Producto' },
          },
          {
            path: 'productos/:id/editar',
            element: <EditarItemPage />,
            handle: { crumb: 'Editar producto' },
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
              {
                path: 'clientes/nuevo',
                element: <NuevoClientePage />,
                handle: { crumb: 'Nuevo cliente' },
              },
              {
                path: 'clientes/:id/editar',
                element: <EditarClientePage />,
                handle: { crumb: 'Editar cliente' },
              },
              {
                path: 'clientes/:id',
                element: <VerDetallesClientePage />,
                handle: { crumb: 'Cliente' },
              },
              {
                path: 'productos',
                element: <ItemPage />,
                handle: { crumb: 'Productos' },
              },
              {
                path: 'productos/nuevo',
                element: <NuevoItemPage />,
                handle: { crumb: 'Nuevo producto' },
              },
              {
                path: 'productos/:id',
                element: <VerDetallesItemPage />,
                handle: { crumb: 'Producto' },
              },
              {
                path: 'productos/:id/editar',
                element: <EditarItemPage />,
                handle: { crumb: 'Editar producto' },
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
