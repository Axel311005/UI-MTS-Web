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
import { useRecepcion } from '@/recepcion/hook/useRecepcion';
import type { Recepcion } from '@/recepcion/types/recepcion.interface';
import { useDebounce } from '@/shared/hooks/use-debounce';

type Props = {
  selectedId?: number | '';
  onSelectId?: (id: number) => void;
  onClear: () => void;
  error?: string;
};

const ITEMS_PER_LOAD = 10;

export const RecepcionSelect: React.FC<Props> = ({
  selectedId,
  onSelectId,
  onClear,
  error,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [displayLimit, setDisplayLimit] = useState(ITEMS_PER_LOAD);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query.trim(), 300);
  const hasQuery = debouncedQuery.length > 0;

  // Cargar recepciones sin búsqueda (para cuando no hay query)
  const { recepciones: allRecepcionesFromHook, isLoading: isLoadingAll } = useRecepcion({ 
    usePagination: false 
  });

  // Filtrar recepciones cuando hay query
  const filtered = useMemo(() => {
    const recepciones = Array.isArray(allRecepcionesFromHook) ? allRecepcionesFromHook : [];
    
    if (!hasQuery) return recepciones;

    const q = debouncedQuery.toLowerCase();
    return recepciones.filter((r) => {
      const codigo = (r.codigoRecepcion || `REC-${r.idRecepcion}`).toLowerCase();
      const placa = r.vehiculo?.placa?.toLowerCase() || '';
      const marca = r.vehiculo?.marca?.toLowerCase() || '';
      const modelo = r.vehiculo?.modelo?.toLowerCase() || '';
      const empleado = `${r.empleado?.primerNombre || ''} ${r.empleado?.primerApellido || ''}`.trim().toLowerCase();
      const estado = (r.estado || '').toString().toLowerCase();
      
      return (
        codigo.includes(q) ||
        placa.includes(q) ||
        marca.includes(q) ||
        modelo.includes(q) ||
        empleado.includes(q) ||
        estado.includes(q)
      );
    });
  }, [allRecepcionesFromHook, debouncedQuery, hasQuery]);

  const isLoading = isLoadingAll;

  // Resetear el límite cuando cambia la búsqueda o se abre el dropdown
  useEffect(() => {
    if (open) {
      setDisplayLimit(ITEMS_PER_LOAD);
    }
  }, [open, query]);

  // Mostrar solo los primeros N elementos
  const displayedRecepciones = useMemo(() => {
    return filtered.slice(0, displayLimit);
  }, [filtered, displayLimit]);

  const hasMore = filtered.length > displayLimit;

  // Calcular altura dinámica basada en la cantidad real de elementos mostrados
  const scrollHeight = useMemo(() => {
    const itemHeight = 48;
    const itemsToShow = displayedRecepciones.length;
    const calculatedHeight = itemsToShow * itemHeight;
    const padding = 16;
    const messageHeight = hasMore ? 32 : 0;
    const maxHeight = 480;
    return Math.min(Math.max(calculatedHeight + padding + messageHeight, itemHeight + padding), maxHeight);
  }, [displayedRecepciones.length, hasMore]);

  const selected = useMemo(() => {
    if (selectedId !== undefined && selectedId !== '') {
      return filtered.find((r) => r.idRecepcion === selectedId);
    }
    return undefined;
  }, [filtered, selectedId]);

  const getRecepcionDisplay = (r: Recepcion) => {
    const codigo = r.codigoRecepcion || `REC-${r.idRecepcion}`;
    const placa = r.vehiculo?.placa || '—';
    const fecha = r.fechaRecepcion 
      ? new Date(r.fechaRecepcion).toLocaleDateString('es-PY', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit' 
        })
      : '—';
    return `${codigo} · ${placa} · ${fecha}`;
  };

  return (
    <div className="space-y-2">
      {selected ? (
        <div className="inline-flex items-center gap-2 rounded-md bg-muted px-3 py-2">
          <div className="flex flex-col">
            <span className="font-medium leading-tight">
              {getRecepcionDisplay(selected)}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            aria-label="Quitar recepción"
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
              Seleccionar recepción (opcional)...
              <span className="ml-2 text-xs text-muted-foreground">▼</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[400px] p-0">
            <div className="p-2 border-b">
              <Input
                autoFocus
                placeholder="Buscar por código, placa, vehículo, empleado o estado..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const first = filtered[0];
                    if (first && onSelectId) {
                      onSelectId(first.idRecepcion);
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
                  setDisplayLimit((prev) => Math.min(prev + ITEMS_PER_LOAD, filtered.length));
                }
              }}
            >
              <div className="py-1">
                {isLoading ? (
                  <div className="px-3 py-6 text-sm text-muted-foreground">
                    Cargando recepciones...
                  </div>
                ) : displayedRecepciones.length > 0 ? (
                  <>
                    {displayedRecepciones.map((r) => (
                      <DropdownMenuItem
                        key={r.idRecepcion}
                        onClick={() => {
                          if (onSelectId) onSelectId(r.idRecepcion);
                          setOpen(false);
                        }}
                        className="cursor-pointer"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium leading-tight">
                            {getRecepcionDisplay(r)}
                          </span>
                        </div>
                      </DropdownMenuItem>
                    ))}
                    {hasMore && (
                      <div className="px-3 py-2 text-xs text-muted-foreground text-center">
                        Mostrando {displayLimit} de {filtered.length} recepciones. Desplázate para ver más...
                      </div>
                    )}
                  </>
                ) : (
                  <div className="px-3 py-6 text-sm text-muted-foreground">
                    No se encontraron recepciones.
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

