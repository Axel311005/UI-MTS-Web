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
import { useAseguradora } from '@/aseguradora/hook/useAseguradora';
import { EstadoActivo } from '@/shared/types/status';
import type { PaginatedResponse } from '@/shared/types/pagination';
import type { Aseguradora } from '@/aseguradora/types/aseguradora.interface';
import { SearchAseguradorasAction } from '@/aseguradora/actions/search-aseguradoras-action';
import { useDebounce } from '@/shared/hooks/use-debounce';

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
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [displayLimit, setDisplayLimit] = useState(10);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query.trim(), 300);
  const hasQuery = debouncedQuery.length > 0;

  // Cargar aseguradoras sin búsqueda (para cuando no hay query)
  const { aseguradoras: allAseguradorasFromHook, isLoading: isLoadingAll } = useAseguradora({ 
    usePagination: false 
  });

  // Filtrar solo activas cuando no hay búsqueda
  const allAseguradoras = useMemo(() => {
    if (hasQuery) return [];
    const aseguradoras = Array.isArray(allAseguradorasFromHook) ? allAseguradorasFromHook : [];
    return aseguradoras.filter((a) => a.activo === EstadoActivo.ACTIVO);
  }, [allAseguradorasFromHook, hasQuery]);

  // Búsqueda usando el backend cuando hay query
  const { data: searchResponse, isLoading: isLoadingSearch } = useQuery<PaginatedResponse<Aseguradora>>({
    queryKey: ['aseguradoras.search.select', debouncedQuery, 30], // Cargar más para scroll
    queryFn: () =>
      SearchAseguradorasAction({
        q: debouncedQuery,
        limit: 30, // Cargar más resultados inicialmente
        offset: 0,
      }),
    enabled: hasQuery,
    staleTime: 1000 * 60 * 5,
  });

  const searchAseguradoras = useMemo(() => {
    if (!searchResponse) return [];
    if (Array.isArray(searchResponse)) return searchResponse;
    return searchResponse.data || [];
  }, [searchResponse]);

  // Determinar qué aseguradoras mostrar
  const filtered = useMemo(() => {
    if (hasQuery) return searchAseguradoras;
    return allAseguradoras;
  }, [hasQuery, searchAseguradoras, allAseguradoras]);

  const isLoading = hasQuery ? isLoadingSearch : isLoadingAll;

  // Resetear el límite cuando cambia la búsqueda o se abre el dropdown
  useEffect(() => {
    if (open) {
      setDisplayLimit(10);
    }
  }, [open, query]);

  // Mostrar solo los primeros N elementos
  const displayedAseguradoras = useMemo(() => {
    return filtered.slice(0, displayLimit);
  }, [filtered, displayLimit]);

  const hasMore = filtered.length > displayLimit;

  // Calcular altura dinámica basada en la cantidad real de elementos mostrados
  const scrollHeight = useMemo(() => {
    const itemHeight = 48;
    const itemsToShow = displayedAseguradoras.length;
    const calculatedHeight = itemsToShow * itemHeight;
    const padding = 16;
    const messageHeight = hasMore ? 32 : 0;
    const maxHeight = 480;
    return Math.min(Math.max(calculatedHeight + padding + messageHeight, itemHeight + padding), maxHeight);
  }, [displayedAseguradoras.length, hasMore]);

  const selected = useMemo(() => {
    if (selectedId !== undefined && selectedId !== '') {
      return filtered.find((a) => a.idAseguradora === selectedId);
    }
    return undefined;
  }, [filtered, selectedId]);

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
                {isLoading ? (
                  <div className="px-3 py-6 text-sm text-muted-foreground">
                    Cargando aseguradoras...
                  </div>
                ) : displayedAseguradoras.length > 0 ? (
                  <>
                    {displayedAseguradoras.map((a) => (
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
                    ))}
                    {hasMore && (
                      <div className="px-3 py-2 text-xs text-muted-foreground text-center">
                        Mostrando {displayLimit} de {filtered.length} aseguradoras. Desplázate para ver más...
                      </div>
                    )}
                  </>
                ) : (
                  <div className="px-3 py-6 text-sm text-muted-foreground">
                    No se encontraron aseguradoras.
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

