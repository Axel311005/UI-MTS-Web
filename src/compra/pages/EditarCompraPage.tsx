import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { useState, useEffect, useMemo } from "react"
import { useParams } from 'react-router'
import { toast } from "sonner"

import { Loader2 } from "lucide-react"
import { CompraLineaTabla } from "../ui/CompraLineaTabla"
import { CompraHeader } from "../ui/CompraHeader"
import { CompraParametros } from "../ui/CompraParametros"
import { CompraTotalCard } from "../ui/CompraTotalCard"

interface CompraFormValues {
  consecutivoId: number | ""
  codigoPreview: string
  fecha: string
  empleado: { id: number; nombre: string }
  estado: "PENDIENTE" | "COMPLETADA" | "ANULADA"
  monedaId: number | ""
  tipoPagoId: number | ""
  impuestoId: number | ""
  bodegaId: number | ""
  comentario: string
  descuentoPct: number | ""
  lineas: Array<{
    itemId: number | ""
    cantidad: number | ""
    precioUnitario: number | ""
    totalLinea: number
  }>
  totales: {
    subtotal: number
    totalDescuento: number
    totalImpuesto: number
    total: number
  }
}

export default function EditarCompraPage() {
  const { id } = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Mock empleado data
  const empleadoForForm = useMemo(() => ({ id: 1, nombre: "Juan Pérez" }), [])

  const [formValues, setFormValues] = useState<CompraFormValues>({
    consecutivoId: "",
    codigoPreview: "",
    fecha: new Date().toISOString().split("T")[0],
    empleado: empleadoForForm,
    estado: "PENDIENTE",
    monedaId: "",
    tipoPagoId: "",
    impuestoId: "",
    bodegaId: "",
    comentario: "",
    descuentoPct: "",
    lineas: [],
    totales: {
      subtotal: 0,
      totalDescuento: 0,
      totalImpuesto: 0,
      total: 0,
    },
  })

  // Load compra data
  useEffect(() => {
    const loadCompra = async () => {
      try {
        // Mock API call - simulate loading existing compra
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Mock data
        setFormValues({
          consecutivoId: 1,
          codigoPreview: "CO-000001",
          fecha: "2025-10-30",
          empleado: empleadoForForm,
          estado: "PENDIENTE",
          monedaId: 1,
          tipoPagoId: 1,
          impuestoId: 1,
          bodegaId: 1,
          comentario: "Compra de insumos",
          descuentoPct: 10,
          lineas: [
            {
              itemId: 1,
              cantidad: 10,
              precioUnitario: 100,
              totalLinea: 1000,
            },
          ],
          totales: {
            subtotal: 1000,
            totalDescuento: 100,
            totalImpuesto: 135,
            total: 1035,
          },
        })
      } catch (err) {
        console.error("Error cargando compra:", err)
        toast.error("No se pudo cargar la compra")
      } finally {
        setIsLoading(false)
      }
    }

    loadCompra()
  }, [id, empleadoForForm])

  const isFormValid = () => {
    const hasSomeItem = formValues.lineas.some((l) => l.itemId !== "")
    return (
      formValues.consecutivoId !== "" &&
      formValues.fecha !== "" &&
      formValues.monedaId !== "" &&
      formValues.tipoPagoId !== "" &&
      formValues.impuestoId !== "" &&
      formValues.bodegaId !== "" &&
      hasSomeItem
    )
  }

  const handleSave = async () => {
    if (isSaving) return
    if (!isFormValid()) {
      toast.error("Faltan datos obligatorios")
      return
    }
    const dismiss = toast.loading("Actualizando compra...")
    setIsSaving(true)
    try {
      console.log("Actualizando compra:", formValues)

      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast.success("Compra actualizada correctamente")
    } catch (err: any) {
      console.error("Error actualizando compra:", err)
      toast.error("No se pudo actualizar la compra")
    } finally {
      toast.dismiss(dismiss)
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    toast.info("Cancelado", { description: "Operación cancelada." })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Editar Compra</h1>
        <p className="text-muted-foreground">Modifica los datos de la compra {formValues.codigoPreview}</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle>Información general</CardTitle>
            </CardHeader>
            <CardContent>
              <CompraHeader
                consecutivoId={formValues.consecutivoId}
                onConsecutivoChange={(value) => setFormValues((prev) => ({ ...prev, consecutivoId: value }))}
                fecha={formValues.fecha}
                onFechaChange={(value) => setFormValues((prev) => ({ ...prev, fecha: value }))}
                empleado={formValues.empleado}
                estado={formValues.estado}
                onEstadoChange={(value) => setFormValues((prev) => ({ ...prev, estado: value }))}
                codigoPreview={formValues.codigoPreview}
              />
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle>Parámetros de compra</CardTitle>
            </CardHeader>
            <CardContent>
              <CompraParametros
                monedaId={formValues.monedaId}
                onMonedaChange={(value) => setFormValues((prev) => ({ ...prev, monedaId: value }))}
                tipoPagoId={formValues.tipoPagoId}
                onTipoPagoChange={(value) => setFormValues((prev) => ({ ...prev, tipoPagoId: value }))}
                impuestoId={formValues.impuestoId}
                onImpuestoChange={(value) => setFormValues((prev) => ({ ...prev, impuestoId: value }))}
                bodegaId={formValues.bodegaId}
                onBodegaChange={(value) => setFormValues((prev) => ({ ...prev, bodegaId: value }))}
                comentario={formValues.comentario}
                onComentarioChange={(value) => setFormValues((prev) => ({ ...prev, comentario: value }))}
              />
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-primary">
            <CardContent className="pt-6">
              <CompraLineaTabla
                lines={formValues.lineas}
                monedaId={formValues.monedaId}
                onLinesChange={(lines) => setFormValues((prev) => ({ ...prev, lineas: lines }))}
              />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <CompraTotalCard
              totals={formValues.totales}
              descuentoPct={formValues.descuentoPct}
              onDescuentoPctChange={(value) => setFormValues((prev) => ({ ...prev, descuentoPct: value }))}
              onSave={handleSave}
              onCancel={handleCancel}
              isValid={isFormValid() && !isSaving}
              isEdit={true}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
