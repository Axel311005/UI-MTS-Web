import * as React from 'react';
import { useNavigate, useParams } from 'react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { CitaForm, type CitaFormValues } from '../ui/CitaForm';
import { getCitaByIdAction } from '../actions/get-cita-by-id';
import { patchCitaAction } from '../actions/patch-cita';

const toDateTimeLocal = (value: unknown): string => {
  if (!value) return '';
  if (typeof value === 'string') {
    try {
      const d = new Date(value);
      if (!Number.isNaN(d.getTime())) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      }
    } catch {}
  }
  return '';
};

export default function EditarCitasPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const queryClient = useQueryClient();
  const idCita = id ? Number(id) : null;

  const {
    data: cita,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['cita', idCita],
    queryFn: () => getCitaByIdAction(idCita!),
    enabled: !!idCita && Number.isFinite(idCita) && idCita > 0,
    retry: 1,
  });

  // Mostrar toast de error si hay un error
  React.useEffect(() => {
    if (isError && error) {
      const errorMessage =
        (error as any)?.response?.data?.message ||
        (error instanceof Error ? error.message : 'No se pudo cargar la cita');
      toast.error(errorMessage);
    }
  }, [isError, error]);

  const handleSubmit = async (data: CitaFormValues) => {
    if (!idCita || !Number.isFinite(idCita) || idCita <= 0) {
      toast.error('ID de cita no válido');
      return;
    }
    try {
      await patchCitaAction(idCita, {
        idCliente: data.idCliente,
        idVehiculo: data.idVehiculo,
        idMotivoCita: data.idMotivoCita,
        fechaInicio: data.fechaInicio,
        estado: data.estado,
        canal: data.canal,
      });

      await queryClient.invalidateQueries({ queryKey: ['citas'] });
      await queryClient.invalidateQueries({
        queryKey: ['cita', idCita],
      });

      toast.success('Cita actualizada exitosamente');

      navigate('/admin/citas');
    } catch (error) {
      const message =
        (error as any)?.response?.data?.message ||
        (error instanceof Error
          ? error.message
          : 'No se pudo actualizar la cita');
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Editar Cita</h1>
        <p className="text-muted-foreground">Modificar los datos de la cita</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información de la Cita</CardTitle>
          <CardDescription>Actualice los datos de la cita</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <p className="text-sm text-muted-foreground">Cargando cita...</p>
          )}
          {isError && (
            <div className="space-y-2">
              <p className="text-sm text-destructive font-medium">
                No se pudo cargar la cita
              </p>
              {error && (
                <p className="text-xs text-muted-foreground">
                  {(error as any)?.response?.data?.message ||
                    (error instanceof Error
                      ? error.message
                      : 'Error desconocido')}
                </p>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/citas')}
              >
                Volver a la lista
              </Button>
            </div>
          )}
          {!!cita && (
            <CitaForm
              defaultValues={{
                idCliente: cita.cliente?.idCliente,
                idVehiculo: cita.vehiculo?.idVehiculo,
                idMotivoCita: cita.motivoCita?.idMotivoCita,
                fechaInicio: toDateTimeLocal(cita.fechaInicio),
                estado: cita.estado,
                canal: cita.canal,
              }}
              onSubmit={handleSubmit}
              onCancel={() => navigate('/citas')}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
