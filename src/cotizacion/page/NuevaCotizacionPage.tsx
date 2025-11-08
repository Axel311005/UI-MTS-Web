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
import { CotizacionForm, type CotizacionFormValues } from '../ui/CotizacionForm';
import { postCotizacionAction } from '../actions/post-cotizacion';

export default function NuevaCotizacionPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleSubmit = async (data: CotizacionFormValues) => {
    try {
      await postCotizacionAction(data);

      await queryClient.invalidateQueries({ queryKey: ['cotizaciones'] });

      toast.success('Cotización creada exitosamente');

      navigate('/cotizaciones');
    } catch (error) {
      const message =
        (error as any)?.response?.data?.message ||
        (error instanceof Error
          ? error.message
          : 'No se pudo crear la cotización');
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nueva Cotización</h1>
        <p className="text-muted-foreground">
          Crear una nueva cotización para un cliente
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información de la Cotización</CardTitle>
          <CardDescription>Complete los datos de la nueva cotización</CardDescription>
        </CardHeader>
        <CardContent>
          <CotizacionForm
            onSubmit={handleSubmit}
            onCancel={() => navigate('/cotizaciones')}
          />
        </CardContent>
      </Card>
    </div>
  );
}

