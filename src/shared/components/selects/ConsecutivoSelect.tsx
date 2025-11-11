import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { X } from '@/shared/icons';
import useConsecutivo from '@/consecutivo/hooks/useConsecutivo';

type ConsecutivoType = 'FACTURA' | 'PROFORMA' | 'RECEPCION' | 'COTIZACION';

type Props = {
  selectedId?: number | '';
  onSelectId: (id: number) => void;
  onClear: () => void;
  error?: string;
  tipo: ConsecutivoType; // 'FACTURA' para id 1, 'PROFORMA' para id 3, 'RECEPCION' para id 5, 'COTIZACION' para id 4
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
  const [displayLimit, setDisplayLimit] = useState(10);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

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
    } else if (tipo === 'COTIZACION') {
      // Solo mostrar consecutivo con id 4 (para cotizaciones)
      return consecutivos.filter((c) => c.idConsecutivo === 4);
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

  // Resetear el límite cuando cambia la búsqueda o se abre el dropdown
  useEffect(() => {
    if (open) {
      setDisplayLimit(10);
    }
  }, [open, query]);

  // Mostrar solo los primeros N elementos
  const displayedConsecutivos = useMemo(() => {
    return filtered.slice(0, displayLimit);
  }, [filtered, displayLimit]);

  const hasMore = filtered.length > displayLimit;

  // Calcular altura dinámica basada en la cantidad real de elementos mostrados
  const scrollHeight = useMemo(() => {
    const itemHeight = 48;
    const itemsToShow = displayedConsecutivos.length;
    const calculatedHeight = itemsToShow * itemHeight;
    const padding = 16;
    const messageHeight = hasMore ? 32 : 0;
    const maxHeight = 480;
    return Math.min(Math.max(calculatedHeight + padding + messageHeight, itemHeight + padding), maxHeight);
  }, [displayedConsecutivos.length, hasMore]);

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
            <div 
              ref={scrollAreaRef}
              className="overflow-auto"
              style={{ maxHeight: '480px', height: `${scrollHeight}px` }}
              onScroll={(e) => {
                const target = e.currentTarget;
                const scrollBottom = target.scrollHeight - target.scrollTop - target.clientHeight;
                if (scrollBottom < 100 && hasMore) {
                  setDisplayLimit((prev) => Math.min(prev + 10, filtered.length));
                }
              }}
            >
              <div className="py-1">
                {displayedConsecutivos.length > 0 ? (
                  <>
                    {displayedConsecutivos.map((c) => (
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
                    ))}
                    {hasMore && (
                      <div className="px-3 py-2 text-xs text-muted-foreground text-center">
                        Mostrando {displayLimit} de {filtered.length} consecutivos. Desplázate para ver más...
                      </div>
                    )}
                  </>
                ) : (
                  <div className="px-3 py-6 text-sm text-muted-foreground">
                    No se encontraron consecutivos.
                  </div>
                )}
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
};

