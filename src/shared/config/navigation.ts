import type { ComponentType } from 'react';

import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FileText,
  Users,
  Settings,
  TrendingUp,
  Tag,
  Ruler,
  CreditCard,
  Shield,
  Warehouse,
  PackageSearch,
  Car,
  ClipboardList,
  ClipboardCheck,
  Inbox,
  Receipt,
  FileSpreadsheet,
  Calendar,
} from '@/shared/icons';

import type { PanelRole } from '@/auth/store/auth.store';

export interface MenuItem {
  title: string;
  url: string;
  icon: ComponentType<{ className?: string }>;
  userTypes: PanelRole[];
}

// Roles permitidos: 'gerente', 'vendedor' y 'superuser' (superuser tiene acceso completo como gerente)
export const navigationConfig: MenuItem[] = [
  // Navegación principal
  {
    title: 'Dashboard',
    url: '/',
    icon: LayoutDashboard,
    userTypes: ['gerente', 'vendedor'],
  },
  {
    title: 'Productos',
    url: '/productos',
    icon: Package,
    userTypes: ['gerente', 'vendedor'],
  },
  {
    title: 'Clientes',
    url: '/clientes',
    icon: Users,
    userTypes: ['gerente', 'vendedor'],
  },
  {
    title: 'Facturas',
    url: '/facturas',
    icon: FileText,
    userTypes: ['gerente', 'vendedor'],
  },
  {
    title: 'Compras',
    url: '/compras',
    icon: ShoppingCart,
    userTypes: ['gerente', 'vendedor'],
  },
  // Flujos de seguro
  {
    title: 'Vehículos',
    url: '/vehiculos',
    icon: Car,
    userTypes: ['gerente', 'vendedor'],
  },
  {
    title: 'Trámites de Seguros',
    url: '/tramites-seguros',
    icon: ClipboardList,
    userTypes: ['gerente', 'vendedor'],
  },
  {
    title: 'Recepciones',
    url: '/recepciones',
    icon: Inbox,
    userTypes: ['gerente', 'vendedor'],
  },
  {
    title: 'Seguimiento Recepciones',
    url: '/recepcion-seguimiento',
    icon: ClipboardCheck,
    userTypes: ['gerente', 'vendedor'],
  },
  {
    title: 'Proformas',
    url: '/proformas',
    icon: Receipt,
    userTypes: ['gerente', 'vendedor'],
  },
  {
    title: 'Cotizaciones',
    url: '/cotizaciones',
    icon: FileSpreadsheet,
    userTypes: ['gerente', 'vendedor'],
  },
  {
    title: 'Citas',
    url: '/citas',
    icon: Calendar,
    userTypes: ['gerente', 'vendedor'],
  },
  {
    title: 'Bodegas',
    url: '/bodegas',
    icon: Warehouse,
    userTypes: ['gerente', 'superuser'],
  },
  {
    title: 'Inventario',
    url: '/existencia-bodega',
    icon: PackageSearch,
    userTypes: ['gerente', 'superuser'],
  },
  // Catálogos y sistema (solo 'gerente' y 'superuser')
  {
    title: 'Clasificaciones',
    url: '/clasificaciones',
    icon: Tag,
    userTypes: ['gerente', 'superuser'],
  },
  {
    title: 'Unidades de Medida',
    url: '/unidades-medida',
    icon: Ruler,
    userTypes: ['gerente', 'superuser'],
  },
  {
    title: 'Tipos de Pago',
    url: '/tipos-pago',
    icon: CreditCard,
    userTypes: ['gerente', 'superuser'],
  },
  {
    title: 'Aseguradoras',
    url: '/aseguradoras',
    icon: Shield,
    userTypes: ['gerente', 'superuser'],
  },
  {
    title: 'Reportes',
    url: '/reportes',
    icon: TrendingUp,
    userTypes: ['gerente', 'superuser'],
  },
  {
    title: 'Configuración',
    url: '/configuracion',
    icon: Settings,
    userTypes: ['gerente', 'superuser'],
  },
  {
    title: 'Administración',
    url: '/admin',
    icon: Shield,
    userTypes: ['gerente', 'superuser'],
  },
];

export const getNavigationItems = (userType: PanelRole) => {
  // Mapear 'superuser' a 'gerente' para compatibilidad con la navegación
  const mappedType = userType === 'superuser' ? 'gerente' : userType;
  return navigationConfig.filter((item) => item.userTypes.includes(mappedType));
};

export const getGroupedNavigationItems = (userType: PanelRole) => {
  const allItems = getNavigationItems(userType);

  const navigationItems = allItems.filter((item) =>
    [
      'Dashboard',
      'Productos',
      'Clientes',
      'Facturas',
      'Compras',
      'Bodegas',
      'Inventario',
    ].includes(item.title)
  );

  const catalogItems = allItems.filter((item) =>
    ['Clasificaciones', 'Unidades de Medida', 'Tipos de Pago'].includes(
      item.title
    )
  );

  const segurosItems = allItems.filter((item) =>
    [
      'Vehículos',
      'Aseguradoras',
      'Trámites de Seguros',
      'Recepciones',
      'Seguimiento Recepciones',
      'Proformas',
    ].includes(item.title)
  );

  const clientPortalItems = allItems.filter((item) =>
    ['Cotizaciones', 'Citas'].includes(item.title)
  );

  const systemItems = allItems.filter((item) =>
    ['Reportes', 'Configuración', 'Administración'].includes(item.title)
  );

  return {
    navigationItems,
    catalogItems: catalogItems.length > 0 ? catalogItems : undefined,
    segurosItems: segurosItems.length > 0 ? segurosItems : undefined,
    clientPortalItems: clientPortalItems.length > 0 ? clientPortalItems : undefined,
    systemItems: systemItems.length > 0 ? systemItems : undefined,
  };
};
