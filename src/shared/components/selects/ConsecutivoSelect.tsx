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
import useConsecutivo from '@/consecutivo/hooks/useConsecutivo';

type ConsecutivoType = 'FACTURA' | 'PROFORMA' | 'RECEPCION';

type Props = {
  selectedId?: number | '';
  onSelectId: (id: number) => void;
  onClear: () => void;
  error?: string;
  tipo: ConsecutivoType; // 'FACTURA' para id 1, 'PROFORMA' para id 3, 'RECEPCION' para id 5
};

export const ConsecutivoSelect: React.FC<Props> = ({
  selectedId,
  onSelectId,
  onClear,
  error,
  tipo,
}) => {
  const { consecutivos = [] } = useConsecutivo();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  // Filtrar consecutivos según el tipo
  const filteredByType = useMemo(() => {
    if (tipo === 'FACTURA') {
      // Solo mostrar consecutivo con id 1 (para facturas)
      return consecutivos.filter((c) => c.idConsecutivo === 1);
    } else if (tipo === 'PROFORMA') {
      // Solo mostrar consecutivo con id 3 (para proformas)
      return consecutivos.filter((c) => c.idConsecutivo === 3);
    } else if (tipo === 'RECEPCION') {
      // Solo mostrar consecutivo con id 5 (para recepciones)
      return consecutivos.filter((c) => c.idConsecutivo === 5);
    }
    return consecutivos;
  }, [consecutivos, tipo]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return filteredByType;
    return filteredByType.filter(
      (c) =>
        (c.descripcion?.toLowerCase?.() ?? '').includes(q) ||
        (c.documento?.toLowerCase?.() ?? '').includes(q) ||
        String(c.idConsecutivo).includes(q)
    );
  }, [filteredByType, query]);

  const selected = useMemo(() => {
    if (selectedId !== undefined && selectedId !== '') {
      return consecutivos.find((c) => c.idConsecutivo === selectedId);
    }
    return undefined;
  }, [consecutivos, selectedId]);

  return (
    <div className="space-y-2">
      {selected ? (
        <div className="inline-flex items-center gap-2 rounded-md bg-muted px-3 py-2">
          <div className="flex flex-col">
            <span className="font-medium leading-tight">{selected.descripcion}</span>
            <span className="text-xs text-muted-foreground leading-tight">
              {selected.documento} - {selected.mascara}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            aria-label="Quitar consecutivo"
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
              Seleccionar consecutivo...
              <span className="ml-2 text-xs text-muted-foreground">▼</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[340px] p-0">
            <div className="p-2 border-b">
              <Input
                autoFocus
                placeholder="Buscar consecutivo..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const first = filtered[0];
                    if (first) {
                      onSelectId(first.idConsecutivo);
                      setOpen(false);
                    }
                  }
                }}
              />
            </div>
            <ScrollArea className="max-h-60">
              <div className="py-1">
                {filtered.length > 0 ? (
                  filtered.map((c) => (
                    <DropdownMenuItem
                      key={c.idConsecutivo}
                      onClick={() => {
                        onSelectId(c.idConsecutivo);
                        setOpen(false);
                      }}
                      className="cursor-pointer"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium leading-tight">
                          {c.descripcion}
                        </span>
                        <span className="text-xs text-muted-foreground leading-tight">
                          {c.documento} - {c.mascara}
                        </span>
                      </div>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="px-3 py-6 text-sm text-muted-foreground">
                    No se encontraron consecutivos.
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

