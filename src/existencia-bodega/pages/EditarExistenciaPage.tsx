import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { ExistenciaForm } from '../ui/ExistenciaForm';
import { useExistenciaBodega } from '../hook/useExistenciaBodega';
import { patchExistenciaBodega } from '../actions/patch-existencia-bodega';
import type { ExistenciaFormData } from '../ui/ExistenciaForm';

export default function EditarExistenciaPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { existencias, isLoading } = useExistenciaBodega();
  
  const existenciaId = useMemo(() => {
    if (!id) return null;
    const numId = Number(id);
    return Number.isFinite(numId) ? numId : null;
  }, [id]);

  const existencia = useMemo(() => {
    if (!existenciaId) return null;
    return existencias.find((ex) => ex.idExistenciaBodega === existenciaId) || null;
  }, [existencias, existenciaId]);

  const [initialData, setInitialData] = useState<ExistenciaFormData | null>(null);

  useEffect(() => {
    if (!existenciaId) {
      toast.error('ID de existencia no proporcionado');
      navigate('/admin/existencia-bodega');
      return;
    }

    if (!isLoading && existencia) {
      setInitialData({
        itemId: existencia.item.idItem,
        bodegaId: existencia.bodega.idBodega,
        existenciaMaxima: existencia.existenciaMaxima,
        existenciaMinima: existencia.existenciaMinima,
        puntoDeReorden: existencia.puntoDeReorden,
      });
    } else if (!isLoading && !existencia) {
      toast.error('Existencia no encontrada');
      navigate('/admin/existencia-bodega');
    }
  }, [existencia, isLoading, existenciaId, navigate]);

  const handleSubmit = async (data: ExistenciaFormData) => {
    if (!existenciaId) {
      toast.error('ID de existencia no válido');
      return;
    }

    const dismiss = toast.loading('Actualizando existencia en bodega...');
    try {
      await patchExistenciaBodega(existenciaId, {
        existenciaMaxima: Number(data.existenciaMaxima),
        existenciaMinima: Number(data.existenciaMinima),
        puntoDeReorden: Number(data.puntoDeReorden),
      });

      toast.success('Existencia en bodega actualizada correctamente');
      await queryClient.invalidateQueries({
        queryKey: ['existencia-bodega'],
        exact: false,
      });

      navigate('/admin/existencia-bodega');
    } catch (error: any) {
      const raw = error?.response?.data;
      const message =
        raw?.message ||
        (typeof raw === 'string' ? raw : undefined) ||
        (error instanceof Error ? error.message : undefined) ||
        'No se pudo actualizar la existencia en bodega';
      toast.error(message);
    } finally {
      toast.dismiss(dismiss);
    }
  };

  if (isLoading || !initialData) {
    return (
      <div className="space-y-6 p-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/existencia-bodega')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Editar Existencia
          </h1>
          <p className="text-muted-foreground">
            Modifica la información de existencia del item
          </p>
        </div>
      </div>

      <ExistenciaForm
        defaultValues={initialData}
        onSubmit={handleSubmit}
        isEditing
      />
    </div>
  );
}
