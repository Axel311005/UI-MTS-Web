import { useNavigate } from 'react-router';
import {
  Package,
  ShoppingCart,
  FileText,
  Users,
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

export default function HomePage() {
  const navigate = useNavigate();
  const isAdmin = useAuthStore((s) => s.isAdmin);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-center">Home</h1>
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
      {/* Recent Activity & Quick Actions */}
      <div className="w-full flex justify-center">
        {/* Quick Actions */}
        <Card className="card-elegant w-full max-w-xl">
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
