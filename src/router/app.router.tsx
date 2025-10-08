import { createBrowserRouter } from 'react-router';
import { AppLayout } from '@/shared/components/layouts/AppLayout';
import { getGroupedNavigationItems } from '@/shared/config/navigation';

const USER_TYPE = 'admin'; //Admin o vendedor

const { navigationItems, catalogItems, systemItems } =
  getGroupedNavigationItems(USER_TYPE);

export const appRouter = createBrowserRouter([
  {
    path: '/',
    element: (
      <AppLayout
        navigationItems={navigationItems}
        catalogItems={catalogItems}
        systemItems={systemItems}
      />
    ),

    children: [
      {
        path: 'facturas',
        lazy: async () => {
          const mod = await import('@/facturas/pages/FacturasPage');
          return { Component: mod.FacturasPage };
        },
        handle: {
          crumb: 'Facturas',
        },
      },
      {
        path: 'facturas/search',
        lazy: async () => {
          const mod = await import('@/facturas/pages/FacturasPage');
          return { Component: mod.FacturasPage };
        },
        handle: {
          crumb: 'Buscar',
        },
      },
      // Agrega aquí más rutas con sus respectivos handles
      // {
      //   path: 'clientes',
      //   element: <ClientesPage />,
      //   handle: {
      //     crumb: 'Clientes',
      //   },
      // },
    ],
  },
]);
