import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { ExistenciaForm } from "../ui/ExistenciaForm";
import { postExistenciaBodega } from "../actions/post-existencia-bodega";
import type { ExistenciaFormData } from "../ui/ExistenciaForm";


export default function NuevaExistenciaPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleSubmit = async (data: ExistenciaFormData) => {
    const dismiss = toast.loading("Creando existencia en bodega...");
    try {
      await postExistenciaBodega({
        itemId: data.itemId,
        bodegaId: data.bodegaId,
        cantDisponible: 0, // Always send 0
        existenciaMaxima: Number(data.existenciaMaxima),
        existenciaMinima: Number(data.existenciaMinima),
        puntoDeReorden: Number(data.puntoDeReorden),
      });
      
      toast.success("Existencia en bodega creada correctamente");
      await queryClient.invalidateQueries({
        queryKey: ['existencia-bodega'],
        exact: false,
      });
      
      navigate("/admin/existencia-bodega");
    } catch (error: any) {
      const raw = error?.response?.data;
      const message =
        raw?.message ||
        (typeof raw === 'string' ? raw : undefined) ||
        (error instanceof Error ? error.message : undefined) ||
        'No se pudo crear la existencia en bodega';
      toast.error(message);
    } finally {
      toast.dismiss(dismiss);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/existencia-bodega")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nueva Existencia</h1>
          <p className="text-muted-foreground">
            Registra la existencia de un item en una bodega
          </p>
        </div>
      </div>

      <ExistenciaForm onSubmit={handleSubmit} />
    </div>
  );
}
