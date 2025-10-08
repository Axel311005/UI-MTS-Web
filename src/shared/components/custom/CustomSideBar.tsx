import { NavLink, useLocation } from 'react-router';
import { Sidebar } from '@/shared/components/ui/sidebar';
import {
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '../ui/sidebar';
import type { MenuItem } from '@/shared/config/navigation';
import { FileText } from '@/shared/icons';

interface SidebarProps {
  navigationItems: MenuItem[];
  catalogItems?: MenuItem[];
  systemItems?: MenuItem[];
  isCollapsed?: boolean;
}

export const CustomSideBar = ({
  navigationItems = [],
  catalogItems = [],
  systemItems = [],
}: SidebarProps) => {
  const location = useLocation();

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? 'bg-primary text-primary-foreground font-medium shadow-md flex items-center gap-2 px-3 py-2 rounded'
      : 'hover:bg-accent hover:text-accent-foreground flex items-center gap-2 px-3 py-2 rounded';

  const isActive = (url: string) => location.pathname === url;

  return (
    <Sidebar
      className="w-64 transition-all duration-300 data-[state=collapsed]:w-16"
      collapsible="icon"
    >
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2 group-data-[state=collapsed]:hidden">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">
              MTS
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sidebar-foreground">
              Sistema
            </span>
            <span className="text-xs text-sidebar-foreground/70">Taller</span>
          </div>
        </div>

        <div className="hidden group-data-[state=collapsed]:flex h-8 w-8 mx-auto rounded-lg bg-primary items-center justify-center">
          <FileText className="h-4 w-4 text-primary-foreground" />
        </div>
      </SidebarHeader>

      <SidebarContent>
        {navigationItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="group-data-[state=collapsed]:hidden">
              Principal
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={getNavCls({ isActive: isActive(item.url) })}
                      >
                        {item.icon && <item.icon className="h-4 w-4" />}
                        <span className="group-data-[state=collapsed]:hidden">
                          {item.title}
                        </span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {catalogItems?.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="group-data-[state=collapsed]:hidden">
              Catálogos
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {catalogItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={getNavCls({ isActive: isActive(item.url) })}
                      >
                        {item.icon && <item.icon className="h-4 w-4" />}
                        <span className="group-data-[state=collapsed]:hidden">
                          {item.title}
                        </span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {systemItems?.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="group-data-[state=collapsed]:hidden">
              Sistema
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {systemItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={getNavCls({ isActive: isActive(item.url) })}
                      >
                        {item.icon && <item.icon className="h-4 w-4" />}
                        <span className="group-data-[state=collapsed]:hidden">
                          {item.title}
                        </span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
};
