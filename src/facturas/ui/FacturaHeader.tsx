import { Check, ChevronsUpDown, RefreshCw, User } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/components/ui/button';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
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

interface Consecutivo {
  idConsecutivo: number;
  descripcion: string;
  mascara: string;
  ultimoValor: number;
}

interface InvoiceHeaderProps {
  consecutivoId: number | '';
  onConsecutivoChange: (value: number | '') => void;
  codigoPreview: string;
  fecha: string;
  onFechaChange: (value: string) => void;
  empleado: { id: number; nombre: string };
  errors?: {
    consecutivo?: string;
    fecha?: string;
  };
}

// Mock data
const mockConsecutivos: Consecutivo[] = [
  {
    idConsecutivo: 1,
    descripcion: 'Consecutivo para facturas de venta',
    mascara: 'FAC-{0}',
    ultimoValor: 9,
  },
  {
    idConsecutivo: 2,
    descripcion: 'Consecutivo para facturas de venta',
    mascara: 'FAC-{0}',
    ultimoValor: 7,
  },
];

export function FacturaHeader({
  consecutivoId,
  onConsecutivoChange,
  codigoPreview,
  fecha,
  onFechaChange,
  empleado,
  errors = {},
}: InvoiceHeaderProps) {
  const [open, setOpen] = useState(false);
  const empleadoAuth = useAuthStore(
    (state) => state.user?.empleado.nombreCompleto
  );
  const selectedConsecutivo = mockConsecutivos.find(
    (c) => c.idConsecutivo === consecutivoId
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  {mockConsecutivos.map((consecutivo) => (
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

      {/* Vista previa del código
      <div className="space-y-2">
        <label className="text-sm font-medium">Código de factura</label>
        <div className="flex gap-2">
          <Input
            value={codigoPreview || "---"}
            readOnly
            className="bg-muted"
          />
          <Button
            variant="outline"
            size="icon"
            aria-label="Refrescar vista previa"
            onClick={() => {}}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div> */}

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
        <Badge variant="secondary" className="w-full justify-center py-2">
          PENDIENTE
        </Badge>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
          <User className="h-4 w-4" />
          <span>Atendido por: {empleadoAuth}</span>
        </div>
      </div>
    </div>
  );
}
