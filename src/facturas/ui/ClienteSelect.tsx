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
import { useCliente } from '@/clientes/hook/useCliente';
import { EstadoActivo } from '@/shared/types/status';

type Props = {
  // Prefer id-based selection
  selectedId?: number | '';
  onSelectId?: (id: number) => void;
  // Backwards compatibility: name-based selection
  value?: string;
  onSelect?: (nombre: string) => void;
  onClear: () => void;
  error?: string;
};

export const ClienteSelect: React.FC<Props> = ({
  selectedId,
  onSelectId,
  value,
  onSelect,
  onClear,
  error,
}) => {
  const { clientes } = useCliente();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const allClientes = useMemo(
    () => (Array.isArray(clientes) ? clientes : []),
    [clientes]
  );
  const activeClientes = useMemo(
    () =>
      allClientes.filter((cliente) => cliente.activo === EstadoActivo.ACTIVO),
    [allClientes]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = activeClientes;
    if (!q) return list;
    return list.filter(
      (c) =>
        (c.nombre?.toLowerCase?.() ?? '').includes(q) ||
        (c.ruc?.toLowerCase?.() ?? '').includes(q)
    );
  }, [activeClientes, query]);

  const selected = useMemo(() => {
    if (selectedId !== undefined && selectedId !== '') {
      return allClientes.find((c) => c.idCliente === selectedId);
    }
    if (value) {
      return allClientes.find((c) => c.nombre === value);
    }
    return undefined;
  }, [allClientes, selectedId, value]);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground flex items-center gap-1"></label>

      {selected ? (
        <div className="inline-flex items-center gap-2 rounded-md bg-muted px-3 py-2">
          <div className="flex flex-col">
            <span className="font-medium leading-tight">{selected.nombre}</span>
            <span className="text-xs text-muted-foreground leading-tight">
              RUC: {selected.ruc}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            aria-label="Quitar cliente"
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
              Seleccionar cliente...
              <span className="ml-2 text-xs text-muted-foreground">▼</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[340px] p-0">
            <div className="p-2 border-b">
              <Input
                autoFocus
                placeholder="Buscar por nombre o RUC..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const v = (
                      e.currentTarget as HTMLInputElement
                    ).value.trim();
                    if (v) {
                      if (onSelect) onSelect(v);
                      setOpen(false);
                    }
                  }
                }}
              />
            </div>
            <ScrollArea className="max-h-60">
              <div className="py-1">
                {filtered && filtered.length > 0 ? (
                  filtered.map((c) => (
                    <DropdownMenuItem
                      key={c.idCliente}
                      onClick={() => {
                        if (onSelectId) onSelectId(c.idCliente);
                        else if (onSelect) onSelect(c.nombre);
                        setOpen(false);
                      }}
                      className="cursor-pointer"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium leading-tight">
                          {c.nombre}
                        </span>
                        <span className="text-xs text-muted-foreground leading-tight">
                          RUC: {c.ruc}
                        </span>
                      </div>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="px-3 py-6 text-sm text-muted-foreground">
                    No se encontraron clientes.
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
