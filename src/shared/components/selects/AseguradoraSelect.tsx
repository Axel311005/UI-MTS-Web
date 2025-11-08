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
import { useAseguradora } from '@/aseguradora/hook/useAseguradora';
import { EstadoActivo } from '@/shared/types/status';

type Props = {
  selectedId?: number | '';
  onSelectId?: (id: number) => void;
  onClear: () => void;
  error?: string;
};

export const AseguradoraSelect: React.FC<Props> = ({
  selectedId,
  onSelectId,
  onClear,
  error,
}) => {
  const { aseguradoras } = useAseguradora({ usePagination: false });
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const allAseguradoras = useMemo(
    () => (Array.isArray(aseguradoras) ? aseguradoras : []),
    [aseguradoras]
  );

  const activeAseguradoras = useMemo(
    () => allAseguradoras.filter((a) => a.activo === EstadoActivo.ACTIVO),
    [allAseguradoras]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = activeAseguradoras;
    if (!q) return list;
    return list.filter((a) => {
      const descripcion = a.descripcion?.toLowerCase() ?? '';
      const telefono = a.telefono?.toLowerCase() ?? '';
      const direccion = a.direccion?.toLowerCase() ?? '';
      const contacto = a.contacto?.toLowerCase() ?? '';
      const searchText = `${descripcion} ${telefono} ${direccion} ${contacto}`;
      return searchText.includes(q);
    });
  }, [activeAseguradoras, query]);

  const selected = useMemo(() => {
    if (selectedId !== undefined && selectedId !== '') {
      return allAseguradoras.find((a) => a.idAseguradora === selectedId);
    }
    return undefined;
  }, [allAseguradoras, selectedId]);

  return (
    <div className="space-y-2">
      {selected ? (
        <div className="inline-flex items-center gap-2 rounded-md bg-muted px-3 py-2">
          <div className="flex flex-col">
            <span className="font-medium leading-tight">
              {selected.descripcion}
            </span>
            {selected.telefono && (
              <span className="text-xs text-muted-foreground leading-tight">
                Tel: {selected.telefono}
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            aria-label="Quitar aseguradora"
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
              Seleccionar aseguradora...
              <span className="ml-2 text-xs text-muted-foreground">▼</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[400px] p-0">
            <div className="p-2 border-b">
              <Input
                autoFocus
                placeholder="Buscar por nombre, teléfono, dirección o contacto..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const first = filtered[0];
                    if (first && onSelectId) {
                      onSelectId(first.idAseguradora);
                      setOpen(false);
                    }
                  }
                }}
              />
            </div>
            <ScrollArea className="max-h-60">
              <div className="py-1">
                {filtered.length > 0 ? (
                  filtered.map((a) => (
                    <DropdownMenuItem
                      key={a.idAseguradora}
                      onClick={() => {
                        if (onSelectId) onSelectId(a.idAseguradora);
                        setOpen(false);
                      }}
                      className="cursor-pointer"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium leading-tight">
                          {a.descripcion}
                        </span>
                        {a.telefono && (
                          <span className="text-xs text-muted-foreground leading-tight">
                            Tel: {a.telefono}
                          </span>
                        )}
                      </div>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="px-3 py-6 text-sm text-muted-foreground">
                    No se encontraron aseguradoras.
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

