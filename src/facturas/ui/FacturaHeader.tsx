import { Check, ChevronsUpDown, User } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/components/ui/button';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover';
import { Input } from '@/shared/components/ui/input';
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/shared/components/ui/command';
import { useState } from 'react';
import { useAuthStore } from '@/auth/store/auth.store';
import { ConsecutivoSelect } from '@/shared/components/selects/ConsecutivoSelect';
import { getEmpleadoNombre } from '@/empleados/utils/empleado.utils';

interface InvoiceHeaderProps {
  consecutivoId: number | '';
  onConsecutivoChange: (value: number | '') => void;
  codigoPreview: string;
  fecha: string;
  onFechaChange: (value: string) => void;
  estado: 'PENDIENTE' | 'PAGADO' | 'ANULADA';
  onEstadoChange: (value: 'PENDIENTE' | 'PAGADO') => void;
  empleado: { id: number; nombre: string };
  errors?: {
    consecutivo?: string;
    fecha?: string;
  };
}

// Ya no usamos mock; se consume desde el hook useConsecutivo

export function FacturaHeader({
  consecutivoId,
  onConsecutivoChange,
  fecha,
  onFechaChange,
  estado,
  onEstadoChange,
  errors = {},
}: InvoiceHeaderProps) {
  const [openEstado, setOpenEstado] = useState(false);
  const empleadoAuth = useAuthStore((state) => {
    const empleado = state.user?.empleado;
    if (!empleado) return '—';
    // Si tiene nombreCompleto (compatibilidad), usarlo; si no, calcular desde primerNombre y primerApellido
    if (empleado.nombreCompleto) return empleado.nombreCompleto;
    return getEmpleadoNombre(empleado as any);
  });
  const opcionesEstado: Array<{
    value: 'PENDIENTE' | 'PAGADO';
    label: string;
  }> = [
    { value: 'PENDIENTE', label: 'Pendiente' },
    { value: 'PAGADO', label: 'Pagado' },
  ];

  const estadoLabels: Record<'PENDIENTE' | 'PAGADO' | 'ANULADA', string> = {
    PENDIENTE: 'Pendiente',
    PAGADO: 'Pagado',
    ANULADA: 'Anulada',
  };
  const estadoActualLabel = estadoLabels[estado] ?? 'Seleccionar...';
  const estadoEsAnulada = estado === 'ANULADA';
  const estadoPopoverOpen = estadoEsAnulada ? false : openEstado;


  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Consecutivo */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Consecutivo <span className="text-destructive">*</span>
        </label>
        <ConsecutivoSelect
          tipo="FACTURA"
          selectedId={consecutivoId || ''}
          onSelectId={(id) => onConsecutivoChange(id)}
          onClear={() => onConsecutivoChange('')}
          error={errors.consecutivo}
        />
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
          className={cn(errors.fecha && 'border-destructive')}
        />
        {errors.fecha && (
          <p className="text-sm text-destructive">{errors.fecha}</p>
        )}
      </div>

      {/* Estado y Empleado */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Estado</label>
        <Popover
          open={estadoPopoverOpen}
          onOpenChange={(nextOpen) => {
            if (estadoEsAnulada) return;
            setOpenEstado(nextOpen);
          }}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={estadoPopoverOpen}
              aria-label="Seleccionar estado"
              className="w-full justify-between"
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
                          onEstadoChange(estadoItem.value);
                          setOpenEstado(false);
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            estado === estadoItem.value
                              ? 'opacity-100'
                              : 'opacity-0'
                          )}
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
          <span>Atendido por: {empleadoAuth}</span>
        </div>
      </div>
    </div>
  );
}
