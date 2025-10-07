import { SidebarProvider } from '@/shared/components/ui/sidebar';
import { AppHeader } from './AppHeader';
import React, { Suspense, lazy } from 'react';
const Breadcrumbs = lazy(() =>
  import('./Breadcrumbs').then((m) => ({ default: m.Breadcrumbs }))
);
const CustomSideBarLazy = lazy(() =>
  import('../custom/CustomSideBar').then((m) => ({ default: m.CustomSideBar }))
);
import type { MenuItem } from '@/shared/config/navigation';
import { Outlet } from 'react-router';

interface AppLayoutProps {
  navigationItems?: MenuItem[];
  catalogItems?: MenuItem[];
  systemItems?: MenuItem[];
  children?: React.ReactNode; // ahora opcional
}

export const AppLayout = ({
  navigationItems = [],
  catalogItems = [],
  systemItems = [],
  children,
}: AppLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {/* Sidebar */}
        <Suspense
          fallback={
            <div className="w-60 p-4 text-xs text-muted-foreground">
              Cargando menú...
            </div>
          }
        >
          <CustomSideBarLazy
            navigationItems={navigationItems}
            catalogItems={catalogItems}
            systemItems={systemItems}
          />
        </Suspense>

        {/* Contenido principal */}
        <div className="flex-1 flex flex-col">
          <AppHeader />

          <main className="flex-1 p-6 space-y-6">
            <Suspense
              fallback={
                <div className="h-4 w-40 rounded bg-muted animate-pulse" />
              }
            >
              <Breadcrumbs />
            </Suspense>
            <div className="animate-fade-in">{children}</div>
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
