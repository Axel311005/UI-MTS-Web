import React, { useMemo, useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { X } from '@/shared/icons';
import { useVehiculo } from '@/vehiculo/hook/useVehiculo';
import { EstadoActivo } from '@/shared/types/status';
import { getClienteNombre } from '@/clientes/utils/cliente.utils';

type Props = {
  selectedId?: number | '';
  onSelectId?: (id: number) => void;
  onClear: () => void;
  error?: string;
};

export const VehiculoSelect: React.FC<Props> = ({
  selectedId,
  onSelectId,
  onClear,
  error,
}) => {
  const { vehiculos } = useVehiculo({ usePagination: false });
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const allVehiculos = useMemo(
    () => (Array.isArray(vehiculos) ? vehiculos : []),
    [vehiculos]
  );

  const activeVehiculos = useMemo(
    () => allVehiculos.filter((v) => v.activo === EstadoActivo.ACTIVO),
    [allVehiculos]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = activeVehiculos;
    if (!q) return list;
    return list.filter((v) => {
      const placa = v.placa?.toLowerCase() ?? '';
      const marca = v.marca?.toLowerCase() ?? '';
      const modelo = v.modelo?.toLowerCase() ?? '';
      const color = v.color?.toLowerCase() ?? '';
      const cliente = v.cliente ? getClienteNombre(v.cliente).toLowerCase() : '';
      const searchText = `${placa} ${marca} ${modelo} ${color} ${cliente}`;
      return searchText.includes(q);
    });
  }, [activeVehiculos, query]);

  const selected = useMemo(() => {
    if (selectedId !== undefined && selectedId !== '') {
      return allVehiculos.find((v) => v.idVehiculo === selectedId);
    }
    return undefined;
  }, [allVehiculos, selectedId]);

  const getVehiculoDisplay = (v: typeof allVehiculos[0]) => {
    const cliente = v.cliente ? getClienteNombre(v.cliente) : '';
    return `${v.placa} · ${v.marca ?? ''} ${v.modelo ?? ''}${cliente ? ` · ${cliente}` : ''}`;
  };

  return (
    <div className="space-y-2">
      {selected ? (
        <div className="inline-flex items-center gap-2 rounded-md bg-muted px-3 py-2">
          <div className="flex flex-col">
            <span className="font-medium leading-tight">
              {getVehiculoDisplay(selected)}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            aria-label="Quitar vehículo"
            onClick={onClear}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild className="h-9">
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className={`w-full justify-between ${
                error ? 'border-destructive' : ''
              }`}
            >
              Seleccionar vehículo...
              <span className="ml-2 text-xs text-muted-foreground">▼</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[400px] p-0">
            <div className="p-2 border-b">
              <Input
                autoFocus
                placeholder="Buscar por placa, marca, modelo, color o cliente..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const first = filtered[0];
                    if (first && onSelectId) {
                      onSelectId(first.idVehiculo);
                      setOpen(false);
                    }
                  }
                }}
              />
            </div>
            <ScrollArea className="max-h-60">
              <div className="py-1">
                {filtered.length > 0 ? (
                  filtered.map((v) => (
                    <DropdownMenuItem
                      key={v.idVehiculo}
                      onClick={() => {
                        if (onSelectId) onSelectId(v.idVehiculo);
                        setOpen(false);
                      }}
                      className="cursor-pointer"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium leading-tight">
                          {getVehiculoDisplay(v)}
                        </span>
                      </div>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="px-3 py-6 text-sm text-muted-foreground">
                    No se encontraron vehículos.
                  </div>
                )}
              </div>
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
};

