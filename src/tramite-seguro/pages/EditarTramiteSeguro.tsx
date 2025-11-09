import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { TramiteSeguroForm } from '../ui/TramiteSeguroForm';
import { getTramiteSeguroByIdAction } from '../actions/get-tramite-seguro-by-id';
import { patchTramiteSeguroAction } from '../actions/patch-tramite-seguro';
import type { TramiteSeguroEstado } from '@/shared/types/status';

export default function EditarTramiteSeguroPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tramiteId = Number(id);
  const isValidId = Number.isFinite(tramiteId) && tramiteId > 0;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['tramiteSeguros', tramiteId],
    queryFn: () => getTramiteSeguroByIdAction(tramiteId),
    enabled: isValidId,
    retry: false,
  });

  const handleSubmit = async (values: {
    idVehiculo: number;
    idCliente: number;
    idAseguradora: number;
    numeroTramite: string;
    estado: TramiteSeguroEstado;
    fechaInicio: string;
    fechaFin?: string;
    observaciones?: string;
  }) => {
    if (!isValidId || isSubmitting) return;
    try {
      setIsSubmitting(true);
      await patchTramiteSeguroAction(tramiteId, {
        idVehiculo: values.idVehiculo,
        idCliente: values.idCliente,
        idAseguradora: values.idAseguradora,
        numeroTramite: values.numeroTramite,
        estado: values.estado,
        fechaInicio: values.fechaInicio,
        fechaFin: values.fechaFin,
        observaciones: values.observaciones,
      });

      await queryClient.invalidateQueries({ queryKey: ['tramiteSeguros'] });
      await queryClient.invalidateQueries({
        queryKey: ['tramiteSeguros', tramiteId],
      });

      toast.success('Trámite de seguro actualizado');
      navigate('/admin/tramites-seguros');
    } catch (err: any) {
      // El backend devuelve: { message: "...", error: "Bad Request", statusCode: 400 }
      const responseData = err?.response?.data;
      
      // Extraer el mensaje del backend - priorizar message que es el campo correcto
      const message = 
        responseData?.message || 
        (err instanceof Error ? err.message : undefined) ||
        'No se pudo actualizar el trámite de seguro';
      
      console.error('Error actualizando trámite de seguro:', {
        error: err,
        response: err?.response,
        responseData,
        extractedMessage: message,
      });
      
      toast.error(message, {
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toOptionalId = (value: unknown) =>
    typeof value === 'number' && Number.isFinite(value) ? value : ('' as const);

  const serializeDate = (value?: string | Date | null) => {
    if (!value) return undefined;
    if (typeof value === 'string') return value;
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      return value.toISOString();
    }
    return undefined;
  };

  const defaultValues = data
    ? {
        idVehiculo: toOptionalId(data.vehiculo?.idVehiculo),
        idCliente: toOptionalId(data.cliente?.idCliente),
        idAseguradora: toOptionalId(data.aseguradora?.idAseguradora),
        numeroTramite: data.numeroTramite ?? '',
        estado: data.estado,
        fechaInicio: serializeDate(data.fechaInicio),
        fechaFin: serializeDate(data.fechaFin),
        observaciones: data.observaciones ?? '',
      }
    : undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Editar Trámite de Seguro</h1>
        <p className="text-muted-foreground">
          Actualice la información del trámite seleccionado.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del trámite</CardTitle>
          <CardDescription>
            Revise y modifique los datos necesarios antes de guardar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isValidId && (
            <p className="text-sm text-destructive">
              El identificador del trámite no es válido.
            </p>
          )}
          {isValidId && isLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Cargando información
              del trámite...
            </div>
          )}
          {isValidId && isError && !isLoading && (
            <p className="text-sm text-destructive">
              {error instanceof Error
                ? error.message
                : 'No se pudo obtener la información del trámite.'}
            </p>
          )}
          {isValidId && !isLoading && data && (
            <TramiteSeguroForm
              defaultValues={defaultValues}
              onSubmit={handleSubmit}
              onCancel={() => navigate('/tramites-seguros')}
              isSubmitting={isSubmitting}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
