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
import { useVehiculo } from '@/vehiculo/hook/useVehiculo';
import { EstadoActivo } from '@/shared/types/status';
import { getClienteNombre } from '@/clientes/utils/cliente.utils';
import type { PaginatedResponse } from '@/shared/types/pagination';
import type { Vehiculo } from '@/vehiculo/types/vehiculo.interface';
import { SearchVehiculosAction } from '@/vehiculo/actions/search-vehiculos-action';
import { useDebounce } from '@/shared/hooks/use-debounce';

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
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [displayLimit, setDisplayLimit] = useState(10);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query.trim(), 300);
  const hasQuery = debouncedQuery.length > 0;

  // Cargar vehículos sin búsqueda (para cuando no hay query)
  const { vehiculos: allVehiculosFromHook, isLoading: isLoadingAll } = useVehiculo({ 
    usePagination: false 
  });

  // Filtrar solo activos cuando no hay búsqueda
  const allVehiculos = useMemo(() => {
    if (hasQuery) return [];
    const vehiculos = Array.isArray(allVehiculosFromHook) ? allVehiculosFromHook : [];
    return vehiculos.filter((v) => v.activo === EstadoActivo.ACTIVO);
  }, [allVehiculosFromHook, hasQuery]);

  // Búsqueda usando el backend cuando hay query
  const { data: searchResponse, isLoading: isLoadingSearch } = useQuery<PaginatedResponse<Vehiculo>>({
    queryKey: ['vehiculos.search.select', debouncedQuery, 30], // Cargar más para scroll
    queryFn: () =>
      SearchVehiculosAction({
        q: debouncedQuery,
        limit: 30, // Cargar más resultados inicialmente
        offset: 0,
      }),
    enabled: hasQuery,
    staleTime: 1000 * 60 * 5,
  });

  const searchVehiculos = useMemo(() => {
    if (!searchResponse) return [];
    if (Array.isArray(searchResponse)) return searchResponse;
    return searchResponse.data || [];
  }, [searchResponse]);

  // Determinar qué vehículos mostrar
  const filtered = useMemo(() => {
    if (hasQuery) return searchVehiculos;
    return allVehiculos;
  }, [hasQuery, searchVehiculos, allVehiculos]);

  const isLoading = hasQuery ? isLoadingSearch : isLoadingAll;

  // Resetear el límite cuando cambia la búsqueda o se abre el dropdown
  useEffect(() => {
    if (open) {
      setDisplayLimit(10);
    }
  }, [open, query]);

  // Mostrar solo los primeros N elementos
  const displayedVehiculos = useMemo(() => {
    return filtered.slice(0, displayLimit);
  }, [filtered, displayLimit]);

  const hasMore = filtered.length > displayLimit;

  // Calcular altura dinámica basada en la cantidad real de elementos mostrados
  const scrollHeight = useMemo(() => {
    const itemHeight = 48;
    const itemsToShow = displayedVehiculos.length;
    const calculatedHeight = itemsToShow * itemHeight;
    const padding = 16;
    const messageHeight = hasMore ? 32 : 0;
    const maxHeight = 480;
    return Math.min(Math.max(calculatedHeight + padding + messageHeight, itemHeight + padding), maxHeight);
  }, [displayedVehiculos.length, hasMore]);

  const selected = useMemo(() => {
    if (selectedId !== undefined && selectedId !== '') {
      return filtered.find((v) => v.idVehiculo === selectedId);
    }
    return undefined;
  }, [filtered, selectedId]);

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
                    Cargando vehículos...
                  </div>
                ) : displayedVehiculos.length > 0 ? (
                  <>
                    {displayedVehiculos.map((v) => (
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
                    ))}
                    {hasMore && (
                      <div className="px-3 py-2 text-xs text-muted-foreground text-center">
                        Mostrando {displayLimit} de {filtered.length} vehículos. Desplázate para ver más...
                      </div>
                    )}
                  </>
                ) : (
                  <div className="px-3 py-6 text-sm text-muted-foreground">
                    No se encontraron vehículos.
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

