import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Edit, FileText } from 'lucide-react';
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
import { getClienteById } from '../actions/get-cliente-by-id';
import { EstadoActivo } from '@/shared/types/status';
import { getClienteNombre } from '../utils/cliente.utils';

type ClienteDetalle = Awaited<ReturnType<typeof getClienteById>>;

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

const normalizePorcentaje = (value: unknown) => {
  if (value === null || value === undefined) return '0';
  if (typeof value === 'number') return value.toString();
  return String(value);
};

export default function VerDetallesClientePage() {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const clienteId = useMemo(() => Number(params.id), [params.id]);

  const [loading, setLoading] = useState(true);
  const [cliente, setCliente] = useState<ClienteDetalle | null>(null);

  useEffect(() => {
    if (!params.id) {
      toast.error('ID de cliente no proporcionado');
      navigate('/admin/clientes');
      return;
    }

    if (!Number.isFinite(clienteId)) {
      toast.error('ID de cliente inválido');
      navigate('/admin/clientes');
      return;
    }

    const loadCliente = async () => {
      setLoading(true);
      const dismiss = toast.loading('Cargando cliente...');
      try {
        const data = await getClienteById(clienteId);
        setCliente(data);
      } catch (error: any) {
        const raw = error?.response?.data;
        const message =
          raw?.message ||
          (typeof raw === 'string' ? raw : undefined) ||
          (error instanceof Error ? error.message : undefined) ||
          'No se pudo cargar el cliente';
        toast.error(message);
        navigate('/admin/clientes');
      } finally {
        toast.dismiss(dismiss);
        setLoading(false);
      }
    };

    loadCliente();
  }, [clienteId, navigate, params.id]);

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

  if (!cliente) {
    return (
      <div className="space-y-6 p-6">
        <div className="text-center">
          <p className="text-muted-foreground">Cliente no encontrado</p>
          <Button onClick={() => navigate('/clientes')} className="mt-4">
            Volver a Clientes
          </Button>
        </div>
      </div>
    );
  }

  const porcentajeExonerado = normalizePorcentaje(cliente.porcentajeExonerado);
  const fechaCreacion = formatFecha(cliente.fechaCreacion as Date | string);
  const fechaUltModif = formatFecha(
    cliente.fechaUltModif as Date | string | null
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/clientes')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold tracking-tight">
                {getClienteNombre(cliente)}
              </h1>
              <Badge
                variant={
                  cliente.activo === EstadoActivo.ACTIVO
                    ? 'default'
                    : 'secondary'
                }
              >
                {cliente.activo === EstadoActivo.ACTIVO ? 'Activo' : 'Inactivo'}
              </Badge>
              {cliente.esExonerado && (
                <Badge variant="outline">Exonerado</Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1">RUC: {cliente.ruc}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/admin/clientes/${clienteId}/editar`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar Cliente
          </Button>
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Ver Facturas
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="card-elegant">
            <CardHeader>
              <CardTitle>Información de Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Teléfono</p>
                  <p className="font-medium">{cliente.telefono}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">RUC</p>
                  <p className="font-medium">{cliente.ruc}</p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground">Dirección</p>
                <p className="font-medium">{cliente.direccion}</p>
              </div>

              {cliente.notas && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Notas</p>
                    <p className="font-medium text-sm mt-1">{cliente.notas}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="card-elegant">
            <CardHeader>
              <CardTitle>Información Fiscal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Estado</p>
                  <Badge
                    variant={
                      cliente.activo === EstadoActivo.ACTIVO
                        ? 'default'
                        : 'secondary'
                    }
                  >
                    {cliente.activo === EstadoActivo.ACTIVO
                      ? 'Activo'
                      : 'Inactivo'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Cliente Exonerado
                  </p>
                  <Badge variant={cliente.esExonerado ? 'default' : 'outline'}>
                    {cliente.esExonerado ? 'Sí' : 'No'}
                  </Badge>
                </div>
              </div>

              {cliente.esExonerado && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Porcentaje de Exoneración
                    </p>
                    <p className="font-medium text-lg">
                      {porcentajeExonerado}%
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card className="card-elegant">
            <CardHeader>
              <CardTitle>Fechas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Fecha de Creación
                </p>
                <p className="font-medium text-sm">{fechaCreacion}</p>
              </div>

              {cliente.fechaUltModif && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Última Modificación
                    </p>
                    <p className="font-medium text-sm">{fechaUltModif}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="card-elegant">
            <CardHeader>
              <CardTitle>Resumen de Actividad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Total Facturas
                </span>
                <span className="font-bold text-lg">—</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Total Facturado
                </span>
                <span className="font-bold text-lg">—</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Última Factura
                </span>
                <span className="font-medium text-sm">—</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
