import { useParams, useNavigate } from 'react-router';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import { ArrowLeft, Loader2, Edit, Calendar as CalendarIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { getCitaByIdAction } from '../actions/get-cita-by-id';
import type { Cita } from '../types/cita.interface';
import { getClienteNombre } from '@/clientes/utils/cliente.utils';

export default function VerDetallesCitaPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cita, setCita] = useState<Cita | null>(null);

  useEffect(() => {
    const loadCita = async () => {
      try {
        setLoading(true);
        if (!id) {
          throw new Error('ID de cita inválido');
        }

        const idNumber = Number(id);
        if (!Number.isFinite(idNumber) || idNumber <= 0) {
          throw new Error('ID de cita inválido');
        }

        const fetchedCita = await getCitaByIdAction(idNumber);
        setCita(fetchedCita);
      } catch (error) {
        console.error('Error loading cita:', error);
        toast.error('No se pudo cargar la cita');
        navigate('/admin/citas');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadCita();
    }
  }, [id, navigate]);

  const getEstadoBadgeVariant = (estado: string) => {
    const normalized = estado?.toUpperCase?.() ?? '';
    switch (normalized) {
      case 'PROGRAMADA':
        return 'default';
      case 'CONFIRMADA':
        return 'default';
      case 'COMPLETADA':
        return 'default';
      case 'CANCELADA':
        return 'destructive';
      case 'NO_ASISTIO':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const formatDate = (value?: string | Date | null) => {
    if (!value) return '—';
    const dateValue = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(dateValue.getTime())) {
      return String(value);
    }
    return dateValue.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCanalBadge = (canal: string) => {
    const normalized = canal?.toLowerCase?.() ?? '';
    switch (normalized) {
      case 'web':
        return <Badge variant="default">Web</Badge>;
      case 'telefono':
        return <Badge variant="secondary">Teléfono</Badge>;
      case 'presencial':
        return <Badge variant="outline">Presencial</Badge>;
      default:
        return <Badge variant="secondary">{canal}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">
              Cargando detalles de la cita...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!cita) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">No se encontró la cita</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/citas')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">Cita #{cita.idCita}</h1>
              <Badge variant={getEstadoBadgeVariant(cita.estado)}>
                {cita.estado?.toUpperCase?.()}
              </Badge>
              {getCanalBadge(cita.canal)}
            </div>
            <p className="text-muted-foreground">
              Detalles completos de la cita
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate(`/admin/citas/${id}/editar`)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda - Información principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información general */}
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Fecha de inicio
                  </p>
                  <p className="font-medium flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    {formatDate(cita.fechaInicio)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Fecha de fin
                  </p>
                  <p className="font-medium flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    {formatDate(cita.fechaFin)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estado</p>
                  <Badge variant={getEstadoBadgeVariant(cita.estado)}>
                    {cita.estado?.toUpperCase?.()}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Canal</p>
                  {getCanalBadge(cita.canal)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Fecha de creación
                  </p>
                  <p className="font-medium">{formatDate(cita.fechaCreacion)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Última actualización
                  </p>
                  <p className="font-medium">
                    {formatDate(cita.fechaActualizacion)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información del cliente */}
          {cita.cliente && (
            <Card>
              <CardHeader>
                <CardTitle>Información del Cliente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Nombre</p>
                    <p className="font-medium">{getClienteNombre(cita.cliente)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">RUC</p>
                    <p className="font-medium">{cita.cliente.ruc ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Teléfono</p>
                    <p className="font-medium">{cita.cliente.telefono ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Exonerado</p>
                    <p className="font-medium">
                      {cita.cliente.esExonerado
                        ? `Sí (${cita.cliente.porcentajeExonerado ?? '0'}%)`
                        : 'No'}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Dirección</p>
                    <p className="font-medium">{cita.cliente.direccion ?? '—'}</p>
                  </div>
                  {cita.cliente.notas && (
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">Notas</p>
                      <p className="font-medium">{cita.cliente.notas}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Información del vehículo */}
          {cita.vehiculo && (
            <Card>
              <CardHeader>
                <CardTitle>Información del Vehículo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Placa</p>
                    <p className="font-medium">{cita.vehiculo.placa ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Marca</p>
                    <p className="font-medium">{cita.vehiculo.marca ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Modelo</p>
                    <p className="font-medium">{cita.vehiculo.modelo ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Año</p>
                    <p className="font-medium">{cita.vehiculo.anio ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Color</p>
                    <p className="font-medium">{cita.vehiculo.color ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Motor</p>
                    <p className="font-medium">{cita.vehiculo.motor ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Chasis</p>
                    <p className="font-medium">{cita.vehiculo.numChasis ?? '—'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Columna derecha - Detalles adicionales */}
        <div className="lg:col-span-1 space-y-6">
          {/* Información del motivo */}
          {cita.motivoCita && (
            <Card>
              <CardHeader>
                <CardTitle>Motivo de la Cita</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Descripción</p>
                  <p className="font-medium">
                    {cita.motivoCita.descripcion ?? '—'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Resumen */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">ID Cita</p>
                <p className="font-medium font-mono">#{cita.idCita}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Estado</p>
                <Badge variant={getEstadoBadgeVariant(cita.estado)}>
                  {cita.estado?.toUpperCase?.()}
                </Badge>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Canal</p>
                {getCanalBadge(cita.canal)}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

