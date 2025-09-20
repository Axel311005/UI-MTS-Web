import { createBrowserRouter } from 'react-router';
import { AppLayout } from '@/shared/components/layouts/AppLayout';
import { getGroupedNavigationItems } from '@/shared/config/navigation';
import { FacturasPage } from '@/facturas/pages/FacturasPage';

const USER_TYPE = 'vendedor'; //Admin o vendedor

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
        element: <FacturasPage />,
        handle: {
          crumb: 'Facturas',
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
