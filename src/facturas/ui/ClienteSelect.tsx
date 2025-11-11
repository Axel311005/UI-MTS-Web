import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
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
import { EstadoActivo } from '@/shared/types/status';
import { getClienteNombre } from '@/clientes/utils/cliente.utils';
import { useCliente } from '@/clientes/hook/useCliente';
import type { Cliente } from '@/clientes/types/cliente.interface';
import type { PaginatedResponse } from '@/shared/types/pagination';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { SearchClientesAction } from '@/clientes/actions/search-clientes-action';
import { useDebounce } from '@/shared/hooks/use-debounce';

type Props = {
  selectedId?: number | '';
  onSelectId?: (id: number) => void;
  value?: string;
  onSelect?: (nombre: string) => void;
  onClear: () => void;
  error?: string;
};

const ITEMS_VISIBLE = 5; // Mostrar 5 elementos visibles en pantalla
const ITEMS_PER_LOAD = 10; // Cargar 10 elementos a la vez

export const ClienteSelect: React.FC<Props> = ({
  selectedId,
  onSelectId,
  value,
  onSelect,
  onClear,
  error,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [displayLimit, setDisplayLimit] = useState(ITEMS_PER_LOAD);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query.trim(), 300);
  const hasQuery = debouncedQuery.length > 0;

  // Cargar clientes sin búsqueda (para cuando no hay query)
  const { clientes: allClientesFromHook, isLoading: isLoadingAll } = useCliente({ 
    usePagination: false 
  });

  // Filtrar solo activos cuando no hay búsqueda
  const allClientes = useMemo(() => {
    if (hasQuery) return [];
    const clientes = Array.isArray(allClientesFromHook) ? allClientesFromHook : [];
    return clientes.filter((c) => c.activo === EstadoActivo.ACTIVO);
  }, [allClientesFromHook, hasQuery]);

  // Búsqueda usando el backend cuando hay query
  const { data: searchResponse, isLoading: isLoadingSearch } = useQuery<PaginatedResponse<Cliente>>({
    queryKey: ['clientes.search.select', debouncedQuery, ITEMS_PER_LOAD * 3], // Cargar más para scroll
    queryFn: () =>
      SearchClientesAction({
        q: debouncedQuery,
        limit: ITEMS_PER_LOAD * 3, // Cargar más resultados inicialmente
        offset: 0,
      }),
    enabled: hasQuery,
    staleTime: 1000 * 60 * 5,
  });

  const searchClientes = useMemo(() => {
    if (!searchResponse) return [];
    if (Array.isArray(searchResponse)) return searchResponse;
    return searchResponse.data || [];
  }, [searchResponse]);

  // Determinar qué clientes mostrar
  const filtered = useMemo(() => {
    if (hasQuery) return searchClientes;
    return allClientes;
  }, [hasQuery, searchClientes, allClientes]);

  const isLoading = hasQuery ? isLoadingSearch : isLoadingAll;

  // Resetear el límite cuando cambia la búsqueda o se abre el dropdown
  useEffect(() => {
    if (open) {
      setDisplayLimit(ITEMS_PER_LOAD);
    }
  }, [open, query]);

  // Mostrar solo los primeros N elementos
  const displayedClientes = useMemo(() => {
    return filtered.slice(0, displayLimit);
  }, [filtered, displayLimit]);

  const hasMore = filtered.length > displayLimit;

  // Calcular altura: mostrar solo 5 elementos visibles, pero el contenido puede tener más
  // El scrollbar aparecerá automáticamente cuando el contenido sea mayor que la altura
  const scrollHeight = useMemo(() => {
    const itemHeight = 48; // Altura aproximada de cada item
    const visibleItems = ITEMS_VISIBLE; // Solo mostrar 5 visibles
    const calculatedHeight = visibleItems * itemHeight;
    const padding = 16; // Padding interno
    return calculatedHeight + padding; // ~256px para 5 elementos
  }, []);

  // Calcular la altura real del contenido para activar el scroll
  const contentHeight = useMemo(() => {
    const itemHeight = 48;
    const padding = 16;
    return displayedClientes.length * itemHeight + padding;
  }, [displayedClientes.length]);

  // Manejar scroll para cargar más
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const scrollTop = target.scrollTop;
    const scrollHeight = target.scrollHeight;
    const clientHeight = target.clientHeight;
    const scrollBottom = scrollHeight - scrollTop - clientHeight;
    
    // Cargar más cuando esté cerca del final (50px) y haya más datos disponibles
    if (scrollBottom < 50 && hasMore && filtered.length > 0) {
      setDisplayLimit((prev) => {
        const nextLimit = prev + ITEMS_PER_LOAD;
        // Asegurarse de no exceder el total de clientes filtrados
        return Math.min(nextLimit, filtered.length);
      });
    }
  }, [hasMore, filtered.length]);

  // Buscar el cliente seleccionado incluso si no está en la lista filtrada
  const { data: selectedClienteData } = useQuery<Cliente | null>({
    queryKey: ['cliente.byId', selectedId],
    queryFn: async () => {
      if (!selectedId || typeof selectedId !== 'number') return null;
      try {
        const { getClienteById } = await import('@/clientes/actions/get-cliente-by-id');
        return await getClienteById(selectedId);
      } catch {
        return null;
      }
    },
    enabled: !!selectedId && typeof selectedId === 'number' && !filtered.find((c) => c.idCliente === selectedId),
    staleTime: 1000 * 60 * 5,
  });

  const selected = useMemo(() => {
    if (selectedId !== undefined && typeof selectedId === 'number') {
      // Primero buscar en la lista filtrada
      const foundInFiltered = filtered.find((c) => c.idCliente === selectedId);
      if (foundInFiltered) return foundInFiltered;
      // Si no está en la lista filtrada, usar el cliente cargado específicamente
      if (selectedClienteData) return selectedClienteData;
    }
    if (value) {
      return filtered.find((c) => getClienteNombre(c) === value);
    }
    return undefined;
  }, [filtered, selectedId, value, selectedClienteData]);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground flex items-center gap-1"></label>

      {selected ? (
        <div className="inline-flex items-center gap-2 rounded-md bg-muted px-3 py-2">
          <div className="flex flex-col">
            <span className="font-medium leading-tight">{getClienteNombre(selected)}</span>
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
                    if (!v) return;
                    const first = filtered[0];
                    if (first && onSelectId) {
                      onSelectId(first.idCliente);
                    } else if (onSelect) {
                      onSelect(v);
                    }
                    setOpen(false);
                  }
                }}
              />
            </div>
            <div 
              ref={scrollAreaRef}
              className="overflow-y-auto"
              style={{ 
                height: `${scrollHeight}px`,
                minHeight: '64px',
                maxHeight: `${scrollHeight}px`,
                overflowY: contentHeight > scrollHeight ? 'auto' : 'hidden',
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(155, 155, 155, 0.5) transparent'
              }}
              onScroll={handleScroll}
            >
              <div className="py-1">
                {isLoading ? (
                  // Skeleton loaders mientras carga
                  Array.from({ length: ITEMS_VISIBLE }).map((_, i) => (
                    <div key={i} className="px-3 py-2">
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ))
                ) : displayedClientes.length > 0 ? (
                  <>
                    {displayedClientes.map((c) => (
                      <DropdownMenuItem
                        key={c.idCliente}
                        onClick={() => {
                          if (onSelectId) onSelectId(c.idCliente);
                          else if (onSelect) onSelect(getClienteNombre(c));
                          setOpen(false);
                        }}
                        className="cursor-pointer"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium leading-tight">
                            {getClienteNombre(c)}
                          </span>
                          <span className="text-xs text-muted-foreground leading-tight">
                            RUC: {c.ruc}
                          </span>
                        </div>
                      </DropdownMenuItem>
                    ))}
                    {hasMore && (
                      <div className="px-3 py-2 text-xs text-muted-foreground text-center border-t">
                        Mostrando {displayLimit} de {filtered.length} clientes. Desplázate para ver más...
                      </div>
                    )}
                  </>
                ) : (
                  <div className="px-3 py-6 text-sm text-muted-foreground">
                    {query ? 'No se encontraron clientes.' : 'Cargando clientes...'}
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
