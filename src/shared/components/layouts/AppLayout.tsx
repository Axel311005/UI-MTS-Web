import { SidebarProvider } from '@/shared/components/ui/sidebar';
import { AppHeader } from './AppHeader';
import { Suspense, lazy } from 'react';
import { Outlet } from 'react-router';
import { useAuthStore, type PanelRole } from '@/auth/store/auth.store';
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
  segurosItems?: MenuItem[];
  clientPortalItems?: MenuItem[];
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
  segurosItems,
  clientPortalItems,
  systemItems,
}: AppLayoutProps) => {
  const user = useAuthStore((s) => s.user);

  // Generar navegación según roles (gerente, vendedor, superuser)
  let finalNavigationItems: MenuItem[] = navigationItems ?? [];
  let finalCatalogItems = catalogItems;
  let finalSegurosItems = segurosItems;
  let finalClientPortalItems = clientPortalItems;
  let finalSystemItems = systemItems;

  if (!navigationItems) {
    // Obtener todos los roles del usuario
    const rawRoles = user?.roles ?? [];
    const roles = Array.isArray(rawRoles)
      ? rawRoles.map((r) => String(r).toLowerCase().trim())
      : [];
    
    // Si el usuario tiene múltiples roles, obtener items para todos los roles
    // Priorizar superuser > gerente > vendedor para determinar el tipo principal
    let userType: PanelRole = 'vendedor';
    if (roles.includes('superuser')) {
      // Superuser tiene acceso completo como gerente
      userType = 'superuser';
    } else if (roles.includes('gerente')) {
      userType = 'gerente';
    } else if (roles.includes('vendedor')) {
      userType = 'vendedor';
    }
    
    // Obtener items para el tipo principal (superuser se mapea a gerente internamente)
    const grouped = getGroupedNavigationItems(userType);
    finalNavigationItems = grouped.navigationItems;
    finalCatalogItems = grouped.catalogItems;
    finalSegurosItems = grouped.segurosItems;
    finalClientPortalItems = grouped.clientPortalItems;
    finalSystemItems = grouped.systemItems;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Suspense fallback={<SidebarFallback />}>
          <CustomSideBarLazy
            navigationItems={finalNavigationItems}
            catalogItems={finalCatalogItems}
            segurosItems={finalSegurosItems}
            clientPortalItems={finalClientPortalItems}
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
