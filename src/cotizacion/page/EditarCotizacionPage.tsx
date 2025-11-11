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
import {
  CotizacionForm,
  type CotizacionFormValues,
} from '../ui/CotizacionForm';
import { getCotizacionByIdAction } from '../actions/get-cotizacion-by-id';
import { patchCotizacionAction } from '../actions/patch-cotizacion';
import { getClienteNombre } from '@/clientes/utils/cliente.utils';

export default function EditarCotizacionPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const queryClient = useQueryClient();
  const idCotizacion = Number(id);

  const {
    data: cotizacion,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['cotizacion', idCotizacion],
    queryFn: () => getCotizacionByIdAction(idCotizacion),
    enabled: Number.isFinite(idCotizacion) && idCotizacion > 0,
  });

  const handleSubmit = async (data: CotizacionFormValues) => {
    try {
      await patchCotizacionAction(idCotizacion, {
        idCliente: data.idCliente,
        idConsecutivo: data.idConsecutivo,
        estado: data.estado,
        nombreCliente: data.nombreCliente,
      });

      await queryClient.invalidateQueries({ queryKey: ['cotizaciones'] });
      await queryClient.invalidateQueries({
        queryKey: ['cotizacion', idCotizacion],
      });

      toast.success('Cotización actualizada exitosamente');

      navigate('/admin/cotizaciones');
    } catch (error) {
      const message =
        (error as any)?.response?.data?.message ||
        (error instanceof Error
          ? error.message
          : 'No se pudo actualizar la cotización');
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Editar Cotización</h1>
        <p className="text-muted-foreground">
          Actualizar el estado de la cotización
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información de la Cotización</CardTitle>
          <CardDescription>
            {cotizacion && (
              <>
                Código: {cotizacion.codigoCotizacion} | Cliente:{' '}
                {cotizacion.nombreCliente ||
                  (cotizacion.cliente
                    ? getClienteNombre(cotizacion.cliente)
                    : '—')}
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <p className="text-sm text-muted-foreground">
              Cargando cotización...
            </p>
          )}
          {isError && (
            <p className="text-sm text-destructive">
              No se pudo cargar la cotización
            </p>
          )}
          {!!cotizacion && (
            <CotizacionForm
              defaultValues={{
                idCliente: cotizacion.cliente?.idCliente,
                idConsecutivo: cotizacion.consecutivo?.idConsecutivo ?? 4,
                estado: cotizacion.estado,
                nombreCliente: cotizacion.nombreCliente,
              }}
              onSubmit={handleSubmit}
              onCancel={() => navigate('/cotizaciones')}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
