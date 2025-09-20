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
    Shield
  } from 'lucide-react';
  
  export interface MenuItem {
    title: string;
    url: string;
    icon: React.ComponentType<{ className?: string }>;
    userTypes: ('admin' | 'vendedor')[];
  }
  
  // Configuración completa de navegación
  export const navigationConfig: MenuItem[] = [
    // Navegación principal (para ambos tipos de usuario)
    {
      title: 'Dashboard',
      url: '/',
      icon: Home,
      userTypes: ['admin', 'vendedor']
    },
    {
      title: 'Productos',
      url: '/productos',
      icon: Package,
      userTypes: ['admin', 'vendedor']
    },
    {
      title: 'Clientes',
      url: '/clientes',
      icon: Users,
      userTypes: ['admin', 'vendedor']
    },
    {
      title: 'Facturas',
      url: '/facturas',
      icon: FileText,
      userTypes: ['admin', 'vendedor']
    },
    {
      title: 'Compras',
      url: '/compras',
      icon: ShoppingCart,
      userTypes: ['admin', 'vendedor']
    },
  
    // Catálogos (para ambos tipos de usuario)
    {
      title: 'Clasificaciones',
      url: '/clasificaciones',
      icon: Tag,
      userTypes: ['admin', 'vendedor']
    },
    {
      title: 'Unidades de Medida',
      url: '/unidades-medida',
      icon: Ruler,
      userTypes: ['admin', 'vendedor']
    },
    {
      title: 'Tipos de Pago',
      url: '/tipos-pago',
      icon: CreditCard,
      userTypes: ['admin', 'vendedor']
    },
  
    // Sistema (solo para admin)
    {
      title: 'Reportes',
      url: '/reportes',
      icon: BarChart3,
      userTypes: ['admin']
    },
    {
      title: 'Configuración',
      url: '/configuracion',
      icon: Settings,
      userTypes: ['admin']
    },
    {
      title: 'Administración',
      url: '/admin',
      icon: Shield,
      userTypes: ['admin']
    }
  ];
  
  // Función para filtrar items según tipo de usuario
  export const getNavigationItems = (userType: 'admin' | 'vendedor') => {
    return navigationConfig.filter(item => item.userTypes.includes(userType));
  };
  
  // Función para separar items en grupos
  export const getGroupedNavigationItems = (userType: 'admin' | 'vendedor') => {
    const allItems = getNavigationItems(userType);
    
    const navigationItems = allItems.filter(item => 
      ['Dashboard', 'Productos', 'Clientes', 'Facturas', 'Compras'].includes(item.title)
    );
    
    const catalogItems = allItems.filter(item => 
      ['Clasificaciones', 'Unidades de Medida', 'Tipos de Pago'].includes(item.title)
    );
    
    const systemItems = allItems.filter(item => 
      ['Reportes', 'Configuración', 'Administración'].includes(item.title)
    );
  
    return {
      navigationItems,
      catalogItems: catalogItems.length > 0 ? catalogItems : undefined,
      systemItems: systemItems.length > 0 ? systemItems : undefined
    };
  };