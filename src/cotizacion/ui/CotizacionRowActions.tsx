import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Edit, Eye, FileText, MoreHorizontal } from "@/shared/icons";
import { tallerApi } from "@/shared/api/tallerApi";

import type { Cotizacion } from "../types/cotizacion.interface";

interface Props {
  cotizacion: Cotizacion;
}

export function CotizacionRowActions({ cotizacion }: Props) {
  const navigate = useNavigate();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const resolveCotizacionId = () =>
    cotizacion?.idCotizacion ??
    (cotizacion as any)?.id_cotizacion ??
    (cotizacion as any)?.id;

  const cotizacionId = resolveCotizacionId();

  if (!cotizacionId) {
    return null;
  }

  const handleView = () => {
    navigate(`/admin/cotizaciones/${cotizacionId}`);
  };

  const handleEdit = () => {
    navigate(`/admin/cotizaciones/${cotizacionId}/editar`);
  };

  const handleGeneratePdf = async () => {
    if (isGeneratingPdf) return;

    setIsGeneratingPdf(true);
    const dismiss = toast.loading("Generando PDF...");
    try {
      const response = await tallerApi.get(
        `/cotizacion/${cotizacionId}/cotizacion-pdf`,
        { responseType: "blob" }
      );
      const blob = new Blob([response.data], {
        type: "application/pdf",
      });
      const urlBlob = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = urlBlob;
      link.download = `cotizacion-${
        cotizacion.codigoCotizacion || cotizacionId
      }.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(urlBlob);
      toast.success("PDF generado correctamente");
    } catch (error: any) {
      const message = error?.response?.data?.message || "Error al generar PDF";
      toast.error(message);
    } finally {
      toast.dismiss(dismiss);
      setIsGeneratingPdf(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-9 w-9 p-0"
          aria-label={`Acciones para la cotización ${cotizacionId}`}
        >
          <span className="sr-only">Abrir menú</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleView}>
          <Eye className="mr-2 h-4 w-4" />
          Ver detalles
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleEdit}>
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleGeneratePdf}
          disabled={isGeneratingPdf}
        >
          <FileText className="mr-2 h-4 w-4" />
          {isGeneratingPdf ? "Generando..." : "Generar PDF"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
