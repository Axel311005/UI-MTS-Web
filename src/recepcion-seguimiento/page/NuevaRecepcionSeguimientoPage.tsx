import { useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import {
  RecepcionSeguimientoForm,
  type RecepcionSeguimientoFormValues,
} from '../ui/RecepcionSeguimientoForm';
import { postRecepcionSeguimientoAction } from '../actions/post-recepcion-seguimiento';

export default function NuevaRecepcionSeguimientoPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleSubmit = async (data: RecepcionSeguimientoFormValues) => {
    try {
      await postRecepcionSeguimientoAction({
        idRecepcion: data.idRecepcion,
        fecha: data.fecha,
        estado: data.estado,
        descripcion: data.descripcion,
      });

      await queryClient.invalidateQueries({
        queryKey: ['recepcion-seguimiento'],
      });

      toast.success('Seguimiento de recepción creado');

      navigate('/recepcion-seguimiento');
    } catch (error) {
      const message =
        (error as any)?.response?.data?.message ||
        (error instanceof Error
          ? error.message
          : 'No se pudo crear el seguimiento');
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nuevo Seguimiento</h1>
        <p className="text-muted-foreground">
          Crear un nuevo seguimiento de recepción
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Seguimiento</CardTitle>
          <CardDescription>
            Complete los datos del seguimiento de recepción
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RecepcionSeguimientoForm
            onSubmit={handleSubmit}
            onCancel={() => navigate('/recepcion-seguimiento')}
          />
        </CardContent>
      </Card>
    </div>
  );
}

