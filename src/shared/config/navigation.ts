import type { ComponentType } from 'react';

import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FileText,
  Users,
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
  DollarSign,
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
    title: 'Home',
    url: '/admin/home',
    icon: LayoutDashboard,
    userTypes: ['gerente', 'vendedor'],
  },
  {
    title: 'Productos',
    url: '/admin/productos',
    icon: Package,
    userTypes: ['gerente', 'vendedor'],
  },
  {
    title: 'Clientes',
    url: '/admin/clientes',
    icon: Users,
    userTypes: ['gerente', 'vendedor'],
  },
  {
    title: 'Facturas',
    url: '/admin/facturas',
    icon: FileText,
    userTypes: ['gerente', 'vendedor'],
  },
  {
    title: 'Compras',
    url: '/admin/compras',
    icon: ShoppingCart,
    userTypes: ['gerente', 'vendedor'],
  },
  // Flujos de seguro
  {
    title: 'Vehículos',
    url: '/admin/vehiculos',
    icon: Car,
    userTypes: ['gerente', 'vendedor'],
  },
  {
    title: 'Trámites de Seguros',
    url: '/admin/tramites-seguros',
    icon: ClipboardList,
    userTypes: ['gerente', 'vendedor'],
  },
  {
    title: 'Recepciones',
    url: '/admin/recepciones',
    icon: Inbox,
    userTypes: ['gerente', 'vendedor'],
  },
  {
    title: 'Seguimiento Recepciones',
    url: '/admin/recepcion-seguimiento',
    icon: ClipboardCheck,
    userTypes: ['gerente', 'vendedor'],
  },
  {
    title: 'Proformas',
    url: '/admin/proformas',
    icon: Receipt,
    userTypes: ['gerente', 'vendedor'],
  },
  {
    title: 'Cotizaciones',
    url: '/admin/cotizaciones',
    icon: FileSpreadsheet,
    userTypes: ['gerente', 'vendedor'],
  },
  {
    title: 'Citas',
    url: '/admin/citas',
    icon: Calendar,
    userTypes: ['gerente', 'vendedor'],
  },
  {
    title: 'Motivos de Cita',
    url: '/admin/motivos-cita',
    icon: Calendar,
    userTypes: ['gerente', 'superuser'],
  },
  {
    title: 'Bodegas',
    url: '/admin/bodegas',
    icon: Warehouse,
    userTypes: ['gerente', 'superuser'],
  },
  {
    title: 'Inventario',
    url: '/admin/existencia-bodega',
    icon: PackageSearch,
    userTypes: ['gerente', 'superuser'],
  },
  // Catálogos y sistema (solo 'gerente' y 'superuser')
  {
    title: 'Clasificaciones',
    url: '/admin/clasificaciones',
    icon: Tag,
    userTypes: ['gerente', 'superuser'],
  },
  {
    title: 'Unidades de Medida',
    url: '/admin/unidades-medida',
    icon: Ruler,
    userTypes: ['gerente', 'superuser'],
  },
  {
    title: 'Tipos de Pago',
    url: '/admin/tipos-pago',
    icon: CreditCard,
    userTypes: ['gerente', 'superuser'],
  },
  {
    title: 'Monedas',
    url: '/admin/monedas',
    icon: DollarSign,
    userTypes: ['gerente', 'superuser'],
  },
  {
    title: 'Impuestos',
    url: '/admin/impuestos',
    icon: Receipt,
    userTypes: ['gerente', 'superuser'],
  },
  {
    title: 'Aseguradoras',
    url: '/admin/aseguradoras',
    icon: Shield,
    userTypes: ['gerente', 'superuser'],
  },
  {
    title: 'Reportes',
    url: '/admin/reportes',
    icon: TrendingUp,
    userTypes: ['gerente', 'superuser'],
  },
  {
    title: 'Administración',
    url: '/admin/administracion',
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
      'Home',
      'Productos',
      'Clientes',
      'Facturas',
      'Compras',
      'Bodegas',
      'Inventario',
    ].includes(item.title)
  );

  const catalogItems = allItems.filter((item) =>
    [
      'Clasificaciones',
      'Unidades de Medida',
      'Tipos de Pago',
      'Monedas',
      'Impuestos',
    ].includes(item.title)
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
    ['Cotizaciones', 'Citas', 'Motivos de Cita'].includes(item.title)
  );

  const systemItems = allItems.filter((item) =>
    ['Reportes', 'Administración'].includes(item.title)
  );

  return {
    navigationItems,
    catalogItems: catalogItems.length > 0 ? catalogItems : undefined,
    segurosItems: segurosItems.length > 0 ? segurosItems : undefined,
    clientPortalItems:
      clientPortalItems.length > 0 ? clientPortalItems : undefined,
    systemItems: systemItems.length > 0 ? systemItems : undefined,
  };
};
