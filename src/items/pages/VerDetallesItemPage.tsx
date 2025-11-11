import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Edit, Package } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { getItemById } from '../actions/get-item-by-id';
import type { ItemResponse } from '../types/item.response';
import { EstadoActivo } from '@/shared/types/status';

type ItemDetalle = ItemResponse | null;

const formatFecha = (input: string | Date | null | undefined) => {
  if (!input) return '—';
  try {
    const date = input instanceof Date ? input : new Date(input);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
};

const formatPrecio = (value: unknown, moneda: string = 'Gs.') => {
  if (value === null || value === undefined) return `${moneda} 0`;
  const num = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(num)) return `${moneda} 0`;
  return `${moneda} ${num.toLocaleString('es-PY', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

function VerDetallesItemPage() {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const itemId = useMemo(() => Number(params.id), [params.id]);
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState<ItemDetalle>(null);

  useEffect(() => {
    if (!params.id) {
      toast.error('ID de producto no proporcionado');
      navigate('/admin/productos');
      return;
    }
    if (!Number.isFinite(itemId)) {
      toast.error('ID de producto inválido');
      navigate('/admin/productos');
      return;
    }

    const loadItem = async () => {
      setLoading(true);
      const dismiss = toast.loading('Cargando producto...');
      try {
        const data = await getItemById(itemId);
        setItem(data);
      } catch (error: any) {
        const raw = error?.response?.data;
        const message =
          raw?.message ||
          (typeof raw === 'string' ? raw : undefined) ||
          (error instanceof Error ? error.message : undefined) ||
          'No se pudo cargar el producto';
        toast.error(message);
        navigate('/admin/productos');
      } finally {
        toast.dismiss(dismiss);
        setLoading(false);
      }
    };
    loadItem();
  }, [itemId, navigate, params.id]);

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton className="h-96 w-full" />
          </div>
          <div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="space-y-6 p-6">
        <div className="text-center">
          <p className="text-muted-foreground">Producto no encontrado</p>
          <Button onClick={() => navigate('/productos')} className="mt-4">
            Volver a Productos
          </Button>
        </div>
      </div>
    );
  }

  const fechaUltModif = formatFecha(item.fechaUltModif);
  const ultimaSalida = formatFecha(item.ultimaSalida);
  const ultimoIngreso = formatFecha(item.ultimoIngreso);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/productos')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold tracking-tight">
                {item.descripcion}
              </h1>
              <Badge
                variant={
                  item.activo === EstadoActivo.ACTIVO ? 'default' : 'secondary'
                }
              >
                {item.activo === EstadoActivo.ACTIVO ? 'Activo' : 'Inactivo'}
              </Badge>
              <Badge variant="outline">{item.tipo}</Badge>
              {item.esCotizable && <Badge variant="outline">Cotizable</Badge>}
              {item.perecedero && <Badge variant="outline">Perecedero</Badge>}
            </div>
            <p className="text-muted-foreground mt-1">
              Código: {item.codigoItem}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/admin/productos/${itemId}/editar`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar Producto
          </Button>
          <Button variant="outline">
            <Package className="h-4 w-4 mr-2" />
            Ver Movimientos
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="card-elegant">
            <CardHeader>
              <CardTitle>Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Código</p>
                  <p className="font-medium">{item.codigoItem}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tipo</p>
                  <Badge variant="outline">{item.tipo}</Badge>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground">Descripción</p>
                <p className="font-medium">{item.descripcion}</p>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Clasificación</p>
                  <p className="font-medium">
                    {item.clasificacion?.descripcion ?? '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Unidad de Medida
                  </p>
                  <p className="font-medium">
                    {item.unidadMedida?.descripcion ?? '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-elegant">
            <CardHeader>
              <CardTitle>Precios</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Precio Base Local
                  </p>
                  <p className="font-medium text-lg">
                    {formatPrecio(item.precioBaseLocal, 'C$')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Precio Base Dólar
                  </p>
                  <p className="font-medium text-lg">
                    {formatPrecio(item.precioBaseDolar, 'USD')}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Precio Adquisición Local
                  </p>
                  <p className="font-medium">
                    {formatPrecio(item.precioAdquisicionLocal, 'C$')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Precio Adquisición Dólar
                  </p>
                  <p className="font-medium">
                    {formatPrecio(item.precioAdquisicionDolar, 'USD')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card className="card-elegant">
            <CardHeader>
              <CardTitle>Estado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Estado</p>
                <Badge
                  variant={
                    item.activo === EstadoActivo.ACTIVO
                      ? 'default'
                      : 'secondary'
                  }
                >
                  {item.activo === EstadoActivo.ACTIVO ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground">Es Cotizable</p>
                <Badge variant={item.esCotizable ? 'default' : 'outline'}>
                  {item.esCotizable ? 'Sí' : 'No'}
                </Badge>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground">Perecedero</p>
                <Badge variant={item.perecedero ? 'default' : 'outline'}>
                  {item.perecedero ? 'Sí' : 'No'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="card-elegant">
            <CardHeader>
              <CardTitle>Fechas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {item.fechaUltModif && (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Última Modificación
                    </p>
                    <p className="font-medium text-sm">{fechaUltModif}</p>
                    {item.usuarioUltModif && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Por: {item.usuarioUltModif}
                      </p>
                    )}
                  </div>
                  <Separator />
                </>
              )}

              {item.ultimoIngreso && (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Último Ingreso
                    </p>
                    <p className="font-medium text-sm">{ultimoIngreso}</p>
                  </div>
                  <Separator />
                </>
              )}

              {item.ultimaSalida && (
                <div>
                  <p className="text-sm text-muted-foreground">Última Salida</p>
                  <p className="font-medium text-sm">{ultimaSalida}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default VerDetallesItemPage;
