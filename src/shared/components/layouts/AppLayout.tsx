import { SidebarProvider } from '@/shared/components/ui/sidebar';
import { AppHeader } from './AppHeader';
import { Suspense, lazy } from 'react';
import { Outlet } from 'react-router';
import { useAuthStore } from '@/auth/store/auth.store';
import { getGroupedNavigationItems } from '@/shared/config/navigation';
import type { MenuItem } from '@/shared/config/navigation';

const Breadcrumbs = lazy(() =>
  import('./Breadcrumbs').then((m) => ({ default: m.Breadcrumbs }))
);
const CustomSideBarLazy = lazy(() =>
  import('../custom/CustomSideBar').then((m) => ({ default: m.CustomSideBar }))
);

interface AppLayoutProps {
  navigationItems?: MenuItem[];
  catalogItems?: MenuItem[];
  systemItems?: MenuItem[];
}

const SidebarFallback = () => {
  return (
    <div className="w-56 shrink-0 border-r bg-muted/30 p-4 space-y-4 animate-pulse">
      <div className="h-8 w-32 rounded bg-muted" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-4 w-40 rounded bg-muted" />
      ))}
    </div>
  );
};

const BreadcrumbsFallback = () => (
  <div className="h-5 w-48 rounded bg-muted animate-pulse" />
);

export const AppLayout = ({
  navigationItems,
  catalogItems,
  systemItems,
}: AppLayoutProps) => {
  const user = useAuthStore((s) => s.user);
  const isAdmin = useAuthStore((s) => s.isAdmin());

  // Generar navegación según roles (solo 'gerente' y 'vendedor')
  let finalNavigationItems: MenuItem[] = navigationItems ?? [];
  let finalCatalogItems = catalogItems;
  let finalSystemItems = systemItems;

  if (!navigationItems) {
    const userType: 'gerente' | 'vendedor' =
      user && isAdmin ? 'gerente' : 'vendedor';
    const grouped = getGroupedNavigationItems(userType);
    finalNavigationItems = grouped.navigationItems;
    finalCatalogItems = grouped.catalogItems;
    finalSystemItems = grouped.systemItems;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Suspense fallback={<SidebarFallback />}>
          <CustomSideBarLazy
            navigationItems={finalNavigationItems}
            catalogItems={finalCatalogItems}
            systemItems={finalSystemItems}
          />
        </Suspense>

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
