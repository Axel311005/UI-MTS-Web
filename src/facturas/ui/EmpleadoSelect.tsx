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
import { useEmpleado } from '@/empleados/hook/useEmpleado';
import { EstadoActivo } from '@/shared/types/status';
import { getEmpleadoNombre, getEmpleadoSearchText } from '@/empleados/utils/empleado.utils';

type Props = {
  selectedId?: number | '';
  onSelectId?: (id: number) => void;
  value?: string;
  onSelect?: (nombre: string) => void;
  onClear: () => void;
  error?: string;
};

export const EmpleadoSelect: React.FC<Props> = ({
  selectedId,
  onSelectId,
  value,
  onSelect,
  onClear,
  error,
}) => {
  const { empleados } = useEmpleado({ usePagination: false });
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [displayLimit, setDisplayLimit] = useState(10);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const allEmpleados = useMemo(
    () => (Array.isArray(empleados) ? empleados : []),
    [empleados]
  );

  const activeEmpleados = useMemo(
    () => allEmpleados.filter((e) => e.activo === EstadoActivo.ACTIVO),
    [allEmpleados]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = activeEmpleados;
    if (!q) return list;
    return list.filter((e) => {
      const searchText = getEmpleadoSearchText(e);
      return searchText.includes(q);
    });
  }, [activeEmpleados, query]);

  // Resetear el límite cuando cambia la búsqueda o se abre el dropdown
  useEffect(() => {
    if (open) {
      setDisplayLimit(10);
    }
  }, [open, query]);

  // Mostrar solo los primeros N elementos
  const displayedEmpleados = useMemo(() => {
    return filtered.slice(0, displayLimit);
  }, [filtered, displayLimit]);

  const hasMore = filtered.length > displayLimit;

  // Calcular altura dinámica basada en la cantidad real de elementos mostrados
  const scrollHeight = useMemo(() => {
    const itemHeight = 48;
    const itemsToShow = displayedEmpleados.length;
    const calculatedHeight = itemsToShow * itemHeight;
    const padding = 16;
    const messageHeight = hasMore ? 32 : 0;
    const maxHeight = 480; // Altura máxima para 10 elementos
    return Math.min(Math.max(calculatedHeight + padding + messageHeight, itemHeight + padding), maxHeight);
  }, [displayedEmpleados.length, hasMore]);


  const selected = useMemo(() => {
    if (selectedId !== undefined && selectedId !== '') {
      return allEmpleados.find((e) => e.idEmpleado === selectedId);
    }
    if (value) {
      // Buscar por nombre completo
      return allEmpleados.find((e) => getEmpleadoNombre(e) === value);
    }
    return undefined;
  }, [allEmpleados, selectedId, value]);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground flex items-center gap-1"></label>

      {selected ? (
        <div className="inline-flex items-center gap-2 rounded-md bg-muted px-3 py-2">
          <div className="flex flex-col">
            <span className="font-medium leading-tight">{getEmpleadoNombre(selected)}</span>
            <span className="text-xs text-muted-foreground leading-tight">
              Cédula: {selected.cedula}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            aria-label="Quitar empleado"
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
              Seleccionar empleado...
              <span className="ml-2 text-xs text-muted-foreground">▼</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[340px] p-0">
            <div className="p-2 border-b">
              <Input
                autoFocus
                placeholder="Buscar por nombre o cédula..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const v = (
                      e.currentTarget as HTMLInputElement
                    ).value.trim();
                    if (!v) return;
                    // Si hay resultados, seleccionar el primero por ID
                    const first = filtered[0];
                    if (first && onSelectId) {
                      onSelectId(first.idEmpleado);
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
                {displayedEmpleados.length > 0 ? (
                  <>
                    {displayedEmpleados.map((e) => (
                      <DropdownMenuItem
                        key={e.idEmpleado}
                        onClick={() => {
                          if (onSelectId) onSelectId(e.idEmpleado);
                          else if (onSelect) onSelect(getEmpleadoNombre(e));
                          setOpen(false);
                        }}
                        className="cursor-pointer"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium leading-tight">
                            {getEmpleadoNombre(e)}
                          </span>
                          <span className="text-xs text-muted-foreground leading-tight">
                            Cédula: {e.cedula}
                          </span>
                        </div>
                      </DropdownMenuItem>
                    ))}
                    {hasMore && (
                      <div className="px-3 py-2 text-xs text-muted-foreground text-center">
                        Mostrando {displayLimit} de {filtered.length} empleados. Desplázate para ver más...
                      </div>
                    )}
                  </>
                ) : (
                  <div className="px-3 py-6 text-sm text-muted-foreground">
                    No se encontraron empleados.
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

