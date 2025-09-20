import { SidebarProvider } from '@/shared/components/ui/sidebar';
import { AppHeader } from './AppHeader';
import { Breadcrumbs } from './Breadcrumbs';
import type { MenuItem } from '@/shared/config/navigation';
import { CustomSideBar } from '../custom/CustomSideBar';

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
        <CustomSideBar
          navigationItems={navigationItems}
          catalogItems={catalogItems}
          systemItems={systemItems}
        />

        {/* Contenido principal */}
        <div className="flex-1 flex flex-col">
          <AppHeader />

          <main className="flex-1 p-6 space-y-6">
            <Breadcrumbs />
            <div className="animate-fade-in">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
