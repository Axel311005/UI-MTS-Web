import { useNavigate } from 'react-router';
import {
  Package,
  ShoppingCart,
  FileText,
  Users,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
} from 'lucide-react';
import { useAuthStore } from '@/auth/store/auth.store';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';

const stats = [
  {
    title: 'Ingresos del Mes',
    value: '$24,580.50',
    change: '+12.5%',
    trend: 'up',
    icon: DollarSign,
    description: 'vs mes anterior',
  },
  {
    title: 'Productos Activos',
    value: '1,247',
    change: '+8',
    trend: 'up',
    icon: Package,
    description: 'productos en inventario',
  },
  {
    title: 'Compras Pendientes',
    value: '23',
    change: '-5',
    trend: 'down',
    icon: ShoppingCart,
    description: 'órdenes por procesar',
  },
  {
    title: 'Facturas Emitidas',
    value: '156',
    change: '+18',
    trend: 'up',
    icon: FileText,
    description: 'este mes',
  },
];

const recentActivities = [
  {
    id: 1,
    type: 'factura',
    description: 'Nueva factura creada #F-2024-001',
    time: 'hace 2 minutos',
    amount: '$1,250.00',
  },
  {
    id: 2,
    type: 'compra',
    description: 'Compra registrada #C-2024-045',
    time: 'hace 15 minutos',
    amount: '$850.00',
  },
  {
    id: 3,
    type: 'producto',
    description: 'Producto actualizado: Laptop Dell',
    time: 'hace 1 hora',
    amount: null,
  },
  {
    id: 4,
    type: 'cliente',
    description: 'Nuevo cliente registrado',
    time: 'hace 2 horas',
    amount: null,
  },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const isAdmin = useAuthStore((s) => s.isAdmin);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-left">Dashboard</h1>
          <p className="text-muted-foreground text-left">
            Resumen de tu sistema de facturación
          </p>
        </div>
        {isAdmin() && (
          <Button
            className="button-hover"
            onClick={() => navigate('/admin/reportes')}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Ver Reportes
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="card-elegant">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <stat.icon className="h-4 w-4 text-muted-foreground" />
                <Badge
                  variant={stat.trend === 'up' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                  )}
                  {stat.change}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <Card className="card-elegant lg:col-span-2">
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>
              Últimas transacciones y cambios en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
              >
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                  <div>
                    <p className="text-sm font-medium">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                </div>
                {activity.amount && (
                  <Badge variant="outline" className="font-mono">
                    {activity.amount}
                  </Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="card-elegant">
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>Tareas frecuentes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start button-hover"
              onClick={() => navigate('/admin/facturas/nueva')}
            >
              <FileText className="h-4 w-4 mr-2" />
              Nueva Factura
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start button-hover"
              onClick={() => navigate('/admin/compras/nueva')}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Registrar Compra
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start button-hover"
              onClick={() => navigate('/admin/productos/nuevo')}
            >
              <Package className="h-4 w-4 mr-2" />
              Agregar Producto
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start button-hover"
              onClick={() => navigate('/admin/clientes/nuevo')}
            >
              <Users className="h-4 w-4 mr-2" />
              Nuevo Cliente
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
