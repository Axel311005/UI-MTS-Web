import { createBrowserRouter } from 'react-router';
import { AppLayout } from '@/shared/components/layouts/AppLayout';

import { getGroupedNavigationItems } from '@/shared/config/navigation';

const { navigationItems, catalogItems, systemItems } = getGroupedNavigationItems('admin');

export const appRouter = createBrowserRouter([
  {
    path: '/',
    element: (
      <AppLayout
        navigationItems={navigationItems}
        catalogItems={catalogItems}
        systemItems={systemItems}
      >
        {/* Aquí van los hijos o páginas principales */}
      </AppLayout>
    ),
  },
]);
