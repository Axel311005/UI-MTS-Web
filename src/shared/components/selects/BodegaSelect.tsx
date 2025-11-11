import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { X } from '@/shared/icons';
import { useBodega } from '@/bodega/hook/useBodega';

type Props = {
  selectedId?: number | '';
  onSelectId: (id: number) => void;
  onClear: () => void;
  error?: string;
};

export const BodegaSelect: React.FC<Props> = ({
  selectedId,
  onSelectId,
  onClear,
  error,
}) => {
  const { bodegas = [] } = useBodega();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [displayLimit, setDisplayLimit] = useState(10);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return bodegas;
    return bodegas.filter(
      (b) =>
        (b.descripcion?.toLowerCase?.() ?? '').includes(q) ||
        String(b.idBodega).includes(q)
    );
  }, [bodegas, query]);

  // Resetear el límite cuando cambia la búsqueda o se abre el dropdown
  useEffect(() => {
    if (open) {
      setDisplayLimit(10);
    }
  }, [open, query]);

  // Mostrar solo los primeros N elementos
  const displayedBodegas = useMemo(() => {
    return filtered.slice(0, displayLimit);
  }, [filtered, displayLimit]);

  const hasMore = filtered.length > displayLimit;

  // Calcular altura dinámica basada en la cantidad real de elementos mostrados
  const scrollHeight = useMemo(() => {
    const itemHeight = 48;
    const itemsToShow = displayedBodegas.length;
    const calculatedHeight = itemsToShow * itemHeight;
    const padding = 16;
    const messageHeight = hasMore ? 32 : 0;
    const maxHeight = 480;
    return Math.min(Math.max(calculatedHeight + padding + messageHeight, itemHeight + padding), maxHeight);
  }, [displayedBodegas.length, hasMore]);

  // Buscar la bodega seleccionada incluso si no está en la lista cargada
  const { data: selectedBodegaData } = useQuery({
    queryKey: ['bodega.byId', selectedId],
    queryFn: async () => {
      if (!selectedId || typeof selectedId !== 'number') return null;
      try {
        const { getBodegaByIdAction } = await import('@/bodega/actions/get-bodega-by-id');
        return await getBodegaByIdAction(selectedId);
      } catch {
        return null;
      }
    },
    enabled: !!selectedId && typeof selectedId === 'number' && !bodegas.find((b) => b.idBodega === selectedId),
    staleTime: 1000 * 60 * 5,
  });

  const selected = useMemo(() => {
    if (selectedId !== undefined && typeof selectedId === 'number') {
      // Primero buscar en la lista cargada
      const foundInBodegas = bodegas.find((b) => b.idBodega === selectedId);
      if (foundInBodegas) return foundInBodegas;
      // Si no está en la lista, usar la bodega cargada específicamente
      if (selectedBodegaData) return selectedBodegaData;
    }
    return undefined;
  }, [bodegas, selectedId, selectedBodegaData]);

  return (
    <div className="space-y-2">
      {selected ? (
        <div className="inline-flex items-center gap-2 rounded-md bg-muted px-3 py-2">
          <div className="flex flex-col">
            <span className="font-medium leading-tight">{selected.descripcion}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            aria-label="Quitar bodega"
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
              Seleccionar bodega...
              <span className="ml-2 text-xs text-muted-foreground">▼</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[340px] p-0">
            <div className="p-2 border-b">
              <Input
                autoFocus
                placeholder="Buscar bodega..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const first = filtered[0];
                    if (first) {
                      onSelectId(first.idBodega);
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
                {displayedBodegas.length > 0 ? (
                  <>
                    {displayedBodegas.map((b) => (
                      <DropdownMenuItem
                        key={b.idBodega}
                        onClick={() => {
                          onSelectId(b.idBodega);
                          setOpen(false);
                        }}
                        className="cursor-pointer"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium leading-tight">
                            {b.descripcion}
                          </span>
                        </div>
                      </DropdownMenuItem>
                    ))}
                    {hasMore && (
                      <div className="px-3 py-2 text-xs text-muted-foreground text-center">
                        Mostrando {displayLimit} de {filtered.length} bodegas. Desplázate para ver más...
                      </div>
                    )}
                  </>
                ) : (
                  <div className="px-3 py-6 text-sm text-muted-foreground">
                    No se encontraron bodegas.
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

