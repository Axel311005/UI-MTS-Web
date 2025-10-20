
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";

import { ClienteSelect } from "../ui/ClienteSelect";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FacturaHeader } from "../ui/FacturaHeader";
import { FacturaParametros } from "../ui/FacturaParametros";
import { FacturaLineaTabla } from "../ui/FacturaLineasTabla";
import { FacturaTotalCard } from "../ui/FacutraTotalCard";

interface InvoiceFormValues {
  consecutivoId: number | "";
  codigoPreview: string;
  fecha: string;
  empleado: { id: number; nombre: string };
  clienteId: number | "";
  monedaId: number | "";
  tipoPagoId: number | "";
  impuestoId: number | "";
  bodegaId: number | "";
  comentario: string;
  descuentoPct: number | "";
  lineas: Array<{
    itemId: number | "";
    cantidad: number | "";
    precioUnitario: number | "";
    totalLinea: number;
  }>;
  totales: {
    subtotal: number;
    totalDescuento: number;
    totalImpuesto: number;
    total: number;
  };
}

export default function NuevaFacturaPage() {

  
  // Mock empleado from session
  const mockEmpleado = { id: 1, nombre: "Juan Pérez" };

  // Form state (UI only, no real logic)
  const [formValues, setFormValues] = useState<InvoiceFormValues>({
    consecutivoId: "",
    codigoPreview: "",
    fecha: new Date().toISOString().split("T")[0],
    empleado: mockEmpleado,
    clienteId: "",
    monedaId: "",
    tipoPagoId: "",
    impuestoId: "",
    bodegaId: "",
    comentario: "",
    descuentoPct: "",
    lineas: [],
    totales: {
      subtotal: 1500.0,
      totalDescuento: 150.0,
      totalImpuesto: 135.0,
      total: 1485.0,
    },
  });

 

  // Update preview when consecutivo changes (simulated)
  useEffect(() => {
    if (formValues.consecutivoId) {
      setFormValues((prev) => ({
        ...prev,
        codigoPreview: "FAC-000010", // Simulated preview
      }));
    } else {
      setFormValues((prev) => ({ ...prev, codigoPreview: "" }));
    }
  }, [formValues.consecutivoId]);

  // Check if form is valid (basic UI validation)
  const isFormValid = () => {
    return (
      formValues.consecutivoId !== "" &&
      formValues.fecha !== "" &&
      formValues.clienteId !== "" &&
      formValues.monedaId !== "" &&
      formValues.tipoPagoId !== "" &&
      formValues.impuestoId !== "" &&
      formValues.bodegaId !== "" &&
      formValues.lineas.length > 0
    );
  };

  // Handlers (empty, no real logic)
  const handleSave = () => {
    toast.success("Factura guardada", {
        description: "La factura se ha guardado exitosamente (simulado).",
    });
  };

const handleSaveAndNew = () => {
    toast.success("Factura guardada", {
        description: "Nueva factura creada (simulado).",
    });
};

const handleCancel = () => {
    toast.info("Cancelado", {
        description: "Operación cancelada.",
    });
};

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Nueva Factura</h1>
        <p className="text-muted-foreground">
          Completa los datos para crear una nueva factura
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form - Left side */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Section */}
          <Card className="border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle>Información general</CardTitle>
            </CardHeader>
            <CardContent>
              <FacturaHeader
                consecutivoId={formValues.consecutivoId}
                onConsecutivoChange={(value) =>
                  setFormValues((prev) => ({ ...prev, consecutivoId: value }))
                }
                codigoPreview={formValues.codigoPreview}
                fecha={formValues.fecha}
                onFechaChange={(value) =>
                  setFormValues((prev) => ({ ...prev, fecha: value }))
                }
                empleado={formValues.empleado}
              />
            </CardContent>
          </Card>

          {/* Cliente Section */}
          <Card className="border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle>Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <ClienteSelect
                value={formValues.clienteId === "" ? "" : String(formValues.clienteId)}
                onSelect={(id) =>
                  setFormValues((prev) => ({
                    ...prev,
                    clienteId: id ? Number(id) : "",
                  }))
                }
                onClear={() =>
                  setFormValues((prev) => ({
                    ...prev,
                    clienteId: "",
                  }))
                }
              />
            </CardContent>
          </Card>

          {/* Params Section */}
          <Card className="border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle>Parámetros de facturación</CardTitle>
            </CardHeader>
            <CardContent>
              <FacturaParametros
                monedaId={formValues.monedaId}
                onMonedaChange={(value) =>
                  setFormValues((prev) => ({ ...prev, monedaId: value }))
                }
                tipoPagoId={formValues.tipoPagoId}
                onTipoPagoChange={(value) =>
                  setFormValues((prev) => ({ ...prev, tipoPagoId: value }))
                }
                impuestoId={formValues.impuestoId}
                onImpuestoChange={(value) =>
                  setFormValues((prev) => ({ ...prev, impuestoId: value }))
                }
                bodegaId={formValues.bodegaId}
                onBodegaChange={(value) =>
                  setFormValues((prev) => ({ ...prev, bodegaId: value }))
                }
                comentario={formValues.comentario}
                onComentarioChange={(value) =>
                  setFormValues((prev) => ({ ...prev, comentario: value }))
                }
              
              />
            </CardContent>
          </Card>

          {/* Lines Section */}
          <Card className="border-l-4 border-l-primary">
            <CardContent className="pt-6">
              <FacturaLineaTabla
                lines={formValues.lineas}
                onLinesChange={(lines) =>
                  setFormValues((prev) => ({ ...prev, lineas: lines }))
                }
                
              />
            </CardContent>
          </Card>
        </div>

        {/* Totals Card - Right side (sticky on desktop) */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <FacturaTotalCard
              totals={formValues.totales}
              descuentoPct={formValues.descuentoPct}
              onDescuentoPctChange={(value) =>
                setFormValues((prev) => ({ ...prev, descuentoPct: value }))
              }
              onSave={handleSave}
              onSaveAndNew={handleSaveAndNew}
              onCancel={handleCancel}
              isValid={isFormValid()}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
