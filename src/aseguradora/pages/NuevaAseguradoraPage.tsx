import { useState } from 'react';
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
import { AseguradoraForm } from '../ui/AseguradoraForm';
import { postAseguradoraAction } from '../actions/post-aseguradora';

export default function NuevaAseguradoraPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: {
    descripcion: string;
    telefono: string;
    direccion: string;
    contacto: string;
  }) => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      // AseguradoraForm ya sanitiza en tiempo real con sanitizeText
      await postAseguradoraAction(data);
      await queryClient.invalidateQueries({ queryKey: ['aseguradoras'] });
      toast.success('Aseguradora creada');
      navigate('/admin/aseguradoras');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No se pudo crear la aseguradora';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nueva Aseguradora</h1>
        <p className="text-muted-foreground">Crear una nueva aseguradora</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información de la aseguradora</CardTitle>
          <CardDescription>
            Complete los datos requeridos para registrar la aseguradora.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AseguradoraForm
            onSubmit={handleSubmit}
            onCancel={() => navigate('/aseguradoras')}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>
    </div>
  );
}
