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

interface SidebarProps {
  navigationItems: MenuItem[];
  catalogItems?: MenuItem[];
  segurosItems?: MenuItem[];
  clientPortalItems?: MenuItem[];
  systemItems?: MenuItem[];
  isCollapsed?: boolean;
}

export const CustomSideBar = ({
  navigationItems = [],
  catalogItems = [],
  segurosItems = [],
  clientPortalItems = [],
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
      className="w-64 data-[state=collapsed]:w-16"
      collapsible="icon"
    >
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2 group-data-[state=collapsed]:hidden">
          <div className="h-8 w-8 rounded-lg flex items-center justify-center overflow-hidden">
            <img
              src="/logo-mts-trans.png"
              alt="MTS Logo"
              className="h-full w-full object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sidebar-foreground">
              Taller
            </span>
            <span className="text-xs text-sidebar-foreground/70">MTS</span>
          </div>
        </div>

        <div className="hidden group-data-[state=collapsed]:flex h-8 w-8 mx-auto rounded-lg items-center justify-center overflow-hidden">
          <img
            src="/logo-mts-trans.png"
            alt="MTS"
            className="h-full w-full object-contain"
          />
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

        {segurosItems?.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="group-data-[state=collapsed]:hidden">
              Seguros
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {segurosItems.map((item) => (
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

        {clientPortalItems?.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="group-data-[state=collapsed]:hidden">
              Portal Cliente
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {clientPortalItems.map((item) => (
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
