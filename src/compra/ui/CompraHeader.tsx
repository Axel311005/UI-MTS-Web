
import { Check, ChevronsUpDown, User } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover"
import { Input } from "@/shared/components/ui/input"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/shared/components/ui/command"
import { useState } from "react"
import { cn } from "@/shared/lib/utils"

interface CompraHeaderProps {
  consecutivoId: number | ""
  onConsecutivoChange: (value: number | "") => void
  codigoPreview: string
  fecha: string
  onFechaChange: (value: string) => void
  estado: "PENDIENTE" | "COMPLETADA" | "ANULADA"
  onEstadoChange: (value: "PENDIENTE" | "COMPLETADA") => void
  empleado: { id: number; nombre: string }
  errors?: {
    consecutivo?: string
    fecha?: string
  }
}

// Mock consecutivos data
const mockConsecutivos = [
  { idConsecutivo: 1, mascara: "CO-######", descripcion: "Compras General" },
  { idConsecutivo: 2, mascara: "CI-######", descripcion: "Compras Importación" },
]

export function CompraHeader({
  consecutivoId,
  onConsecutivoChange,
  codigoPreview,
  fecha,
  onFechaChange,
  estado,
  onEstadoChange,
  empleado,
  errors = {},
}: CompraHeaderProps) {
  const [open, setOpen] = useState(false)
  const [openEstado, setOpenEstado] = useState(false)

  const selectedConsecutivo = mockConsecutivos.find((c) => c.idConsecutivo === consecutivoId)

  const opcionesEstado: Array<{
    value: "PENDIENTE" | "COMPLETADA"
    label: string
  }> = [
    { value: "PENDIENTE", label: "Pendiente" },
    { value: "COMPLETADA", label: "Completada" },
  ]

  const estadoLabels: Record<"PENDIENTE" | "COMPLETADA" | "ANULADA", string> = {
    PENDIENTE: "Pendiente",
    COMPLETADA: "Completada",
    ANULADA: "Anulada",
  }

  const estadoActualLabel = estadoLabels[estado] ?? "Seleccionar..."
  const estadoEsAnulada = estado === "ANULADA"
  const estadoPopoverOpen = estadoEsAnulada ? false : openEstado

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Consecutivo */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Consecutivo <span className="text-destructive">*</span>
        </label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              aria-label="Seleccionar consecutivo"
              className={cn(
                "w-full justify-between",
                !consecutivoId && "text-muted-foreground",
                errors.consecutivo && "border-destructive",
              )}
            >
              {selectedConsecutivo ? selectedConsecutivo.mascara : "Seleccionar..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Buscar consecutivo..." />
              <CommandList>
                <CommandEmpty>No se encontraron consecutivos.</CommandEmpty>
                <CommandGroup>
                  {mockConsecutivos.map((consecutivo) => (
                    <CommandItem
                      key={consecutivo.idConsecutivo}
                      value={consecutivo.descripcion}
                      onSelect={() => {
                        onConsecutivoChange(consecutivo.idConsecutivo)
                        setOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          consecutivoId === consecutivo.idConsecutivo ? "opacity-100" : "opacity-0",
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{consecutivo.mascara}</span>
                        <span className="text-xs text-muted-foreground">{consecutivo.descripcion}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {errors.consecutivo && <p className="text-sm text-destructive">{errors.consecutivo}</p>}
        {codigoPreview && <p className="text-xs text-muted-foreground">Vista previa: {codigoPreview}</p>}
      </div>

      {/* Fecha */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Fecha <span className="text-destructive">*</span>
        </label>
        <Input
          type="date"
          value={fecha}
          onChange={(e) => onFechaChange(e.target.value)}
          className={cn(errors.fecha && "border-destructive")}
        />
        {errors.fecha && <p className="text-sm text-destructive">{errors.fecha}</p>}
      </div>

      {/* Estado y Empleado */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Estado</label>
        <Popover
          open={estadoPopoverOpen}
          onOpenChange={(nextOpen) => {
            if (estadoEsAnulada) return
            setOpenEstado(nextOpen)
          }}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={estadoPopoverOpen}
              aria-label="Seleccionar estado"
              className="w-full justify-between bg-transparent"
              disabled={estadoEsAnulada}
            >
              {estadoActualLabel}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          {!estadoEsAnulada && (
            <PopoverContent className="w-[200px] p-0" align="start">
              <Command>
                <CommandList>
                  <CommandGroup>
                    {opcionesEstado.map((estadoItem) => (
                      <CommandItem
                        key={estadoItem.value}
                        value={estadoItem.value}
                        onSelect={() => {
                          onEstadoChange(estadoItem.value)
                          setOpenEstado(false)
                        }}
                      >
                        <Check
                          className={cn("mr-2 h-4 w-4", estado === estadoItem.value ? "opacity-100" : "opacity-0")}
                        />
                        {estadoItem.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          )}
        </Popover>
        <div className="flex items-center gap-2 text-sm text-muted-foreground pt-1">
          <User className="h-4 w-4" />
          <span>Registrado por: {empleado.nombre}</span>
        </div>
      </div>
    </div>
  )
}
