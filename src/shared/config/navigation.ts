import {
  Home,
  Package,
  ShoppingCart,
  FileText,
  Users,
  Settings,
  BarChart3,
  Tag,
  Ruler,
  CreditCard,
  Shield,
} from '@/shared/icons';

export interface MenuItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  userTypes: ('gerente' | 'vendedor')[];
}

// Solo 'gerente' y 'vendedor'. Elimina 'admin'.
export const navigationConfig: MenuItem[] = [
  // Navegación principal
  {
    title: 'Dashboard',
    url: '/',
    icon: Home,
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
  // Catálogos y sistema (solo 'gerente')
  {
    title: 'Clasificaciones',
    url: '/clasificaciones',
    icon: Tag,
    userTypes: ['gerente'],
  },
  {
    title: 'Unidades de Medida',
    url: '/unidades-medida',
    icon: Ruler,
    userTypes: ['gerente'],
  },
  {
    title: 'Tipos de Pago',
    url: '/tipos-pago',
    icon: CreditCard,
    userTypes: ['gerente'],
  },
  {
    title: 'Reportes',
    url: '/reportes',
    icon: BarChart3,
    userTypes: ['gerente'],
  },
  {
    title: 'Configuración',
    url: '/configuracion',
    icon: Settings,
    userTypes: ['gerente'],
  },
  {
    title: 'Administración',
    url: '/admin',
    icon: Shield,
    userTypes: ['gerente'],
  },
];

export const getNavigationItems = (userType: 'gerente' | 'vendedor') => {
  return navigationConfig.filter((item) => item.userTypes.includes(userType));
};

export const getGroupedNavigationItems = (userType: 'gerente' | 'vendedor') => {
  const allItems = getNavigationItems(userType);

  const navigationItems = allItems.filter((item) =>
    ['Dashboard', 'Productos', 'Clientes', 'Facturas', 'Compras'].includes(item.title)
  );

  const catalogItems = allItems.filter((item) =>
    ['Clasificaciones', 'Unidades de Medida', 'Tipos de Pago'].includes(item.title)
  );

  const systemItems = allItems.filter((item) =>
    ['Reportes', 'Configuración', 'Administración'].includes(item.title)
  );

  return {
    navigationItems,
    catalogItems: catalogItems.length > 0 ? catalogItems : undefined,
    systemItems: systemItems.length > 0 ? systemItems : undefined,
  };
};