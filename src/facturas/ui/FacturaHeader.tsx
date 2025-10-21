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
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/components/ui/command';
import { useState } from 'react';
import { useAuthStore } from '@/auth/store/auth.store';
import { useConsecutivo } from '@/consecutivo/hooks/useConsecutivo';
import type { Consecutivo } from '@/consecutivo/types/consecutivo.response';

interface InvoiceHeaderProps {
  consecutivoId: number | '';
  onConsecutivoChange: (value: number | '') => void;
  codigoPreview: string;
  fecha: string;
  onFechaChange: (value: string) => void;
  estado: 'PENDIENTE' | 'PAGADO';
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
  const [open, setOpen] = useState(false);
  const [openEstado, setOpenEstado] = useState(false);
  const empleadoAuth = useAuthStore(
    (state) => state.user?.empleado.nombreCompleto
  );
  const { consecutivos } = useConsecutivo();
  const options: Consecutivo[] = Array.isArray(consecutivos)
    ? consecutivos
    : [];
  const selectedConsecutivo = options.find(
    (c) => c.idConsecutivo === consecutivoId
  );
  const estadosFactura = [
    { value: 'PENDIENTE' as const, label: 'Pendiente' },
    { value: 'PAGADO' as const, label: 'Pagado' },
  ];

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
                'w-full justify-between',
                !consecutivoId && 'text-muted-foreground',
                errors.consecutivo && 'border-destructive'
              )}
            >
              {selectedConsecutivo
                ? selectedConsecutivo.mascara
                : 'Seleccionar...'}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Buscar consecutivo..." />
              <CommandList>
                <CommandEmpty>No se encontraron consecutivos.</CommandEmpty>
                <CommandGroup>
                  {options.map((consecutivo) => (
                    <CommandItem
                      key={consecutivo.idConsecutivo}
                      value={consecutivo.descripcion}
                      onSelect={() => {
                        onConsecutivoChange(consecutivo.idConsecutivo);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          consecutivoId === consecutivo.idConsecutivo
                            ? 'opacity-100'
                            : 'opacity-0'
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {consecutivo.mascara}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {consecutivo.descripcion}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {errors.consecutivo && (
          <p className="text-sm text-destructive">{errors.consecutivo}</p>
        )}
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
        <Popover open={openEstado} onOpenChange={setOpenEstado}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openEstado}
              aria-label="Seleccionar estado"
              className="w-full justify-between"
            >
              {estadosFactura.find((e) => e.value === estado)?.label ||
                'Seleccionar...'}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <Command>
              <CommandList>
                <CommandGroup>
                  {estadosFactura.map((estadoItem) => (
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
        </Popover>
        <div className="flex items-center gap-2 text-sm text-muted-foreground pt-1">
          <User className="h-4 w-4" />
          <span>Atendido por: {empleadoAuth}</span>
        </div>
      </div>
    </div>
  );
}
