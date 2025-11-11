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
import { AseguradoraForm } from '../ui/AseguradoraForm';
import { getAseguradoraByIdAction } from '../actions/get-aseguradora-by-id';
import { patchAseguradoraAction } from '../actions/patch-aseguradora';

export default function EditarAseguradoraPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const aseguradoraId = Number(id);
  const isValidId = Number.isFinite(aseguradoraId) && aseguradoraId > 0;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['aseguradoras', aseguradoraId],
    queryFn: () => getAseguradoraByIdAction(aseguradoraId),
    enabled: isValidId,
    retry: false,
  });

  const handleSubmit = async (values: {
    descripcion: string;
    telefono: string;
    direccion: string;
    contacto: string;
  }) => {
    if (!isValidId || isSubmitting) return;
    try {
      setIsSubmitting(true);
      await patchAseguradoraAction(aseguradoraId, values);
      await queryClient.invalidateQueries({ queryKey: ['aseguradoras'] });
      await queryClient.invalidateQueries({
        queryKey: ['aseguradoras', aseguradoraId],
      });
      toast.success('Aseguradora actualizada');
      navigate('/admin/aseguradoras');
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'No se pudo actualizar la aseguradora';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Editar Aseguradora</h1>
        <p className="text-muted-foreground">
          Modificar los datos de la aseguradora
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información de la aseguradora</CardTitle>
          <CardDescription>
            Actualice los datos necesarios y guarde los cambios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isValidId && (
            <p className="text-sm text-destructive">
              El identificador de la aseguradora no es válido.
            </p>
          )}
          {isValidId && isLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Cargando información
              de la aseguradora...
            </div>
          )}
          {isValidId && isError && !isLoading && (
            <p className="text-sm text-destructive">
              {error instanceof Error
                ? error.message
                : 'No se pudo obtener la información de la aseguradora.'}
            </p>
          )}
          {isValidId && !isLoading && data && (
            <AseguradoraForm
              defaultValues={data}
              onSubmit={handleSubmit}
              onCancel={() => navigate('/aseguradoras')}
              isSubmitting={isSubmitting}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
