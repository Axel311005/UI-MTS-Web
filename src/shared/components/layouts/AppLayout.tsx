import { SidebarProvider } from '@/shared/components/ui/sidebar';
import { AppHeader } from './AppHeader';
import { Suspense, lazy, useEffect } from 'react';
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
}

const SidebarFallback = () => (
  <div className="w-56 shrink-0 border-r bg-muted/30 p-4 space-y-4 animate-pulse">
    <div className="h-8 w-32 rounded bg-muted" />
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="h-4 w-40 rounded bg-muted" />
    ))}
  </div>
);

const BreadcrumbsFallback = () => (
  <div className="h-5 w-48 rounded bg-muted animate-pulse" />
);

export const AppLayout = ({
  navigationItems = [],
  catalogItems = [],
  systemItems = [],
}: AppLayoutProps) => {
  useEffect(() => {
    // Se dispara sólo si por algún motivo el Suspense aún no lo cargó.
    import('../custom/CustomSideBar');
  }, []);
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {/* Sidebar lazy con ancho reservado para evitar CLS */}
        <Suspense fallback={<SidebarFallback />}>
          <CustomSideBarLazy
            navigationItems={navigationItems}
            catalogItems={catalogItems}
            systemItems={systemItems}
          />
        </Suspense>

        {/* Contenido principal */}
        <div className="flex-1 flex flex-col">
          <AppHeader />
          <main
            className="flex-1 p-6 space-y-6"
            style={{ contentVisibility: 'auto' }}
          >
            <Suspense fallback={<BreadcrumbsFallback />}>
              <Breadcrumbs />
            </Suspense>
            <div className="animate-fade-in">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
