import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { ItemHeader } from '../ui/ItemHeader';
import { ItemSearchBar } from '../ui/ItemSearchBar';
import { ItemFilters } from '../ui/ItemFilters';
import { ItemTable } from '../ui/ItemTable';
import { useItem } from '../hooks/useItem';
import type { ItemStatusFilter } from '../ui/ItemFilters';
import type { ItemResponse } from '../types/item.response';

export const ItemPage = () => {
  const navigate = useNavigate();
  const { items, isLoading, isError, refetch } = useItem();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [clasificacionFilter, setClasificacionFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<ItemStatusFilter>('ALL');

  const clasificacionOptions = useMemo(() => {
    const descriptions = new Set<string>();
    items.forEach((item) => {
      const label = item.clasificacion?.descripcion?.trim();
      if (label) descriptions.add(label);
    });
    return Array.from(descriptions).sort((a, b) => a.localeCompare(b));
  }, [items]);

  const filteredItems = useMemo<ItemResponse[]>(() => {
    const query = searchTerm.trim().toLowerCase();
    return items
      .filter((item) => {
        if (!query) return true;
        const descripcion = item.descripcion?.toLowerCase?.() ?? '';
        const code = item.codigoItem?.toLowerCase?.() ?? '';
        return descripcion.includes(query) || code.includes(query);
      })
      .filter((item) => {
        if (clasificacionFilter === 'all') return true;
        return (
          item.clasificacion?.descripcion?.toLowerCase?.() ===
          clasificacionFilter.toLowerCase()
        );
      })
      .filter((item) => {
        if (statusFilter === 'ALL') return true;
        const estado = item.estado || (item.activo ? 'ACTIVO' : 'INACTIVO');
        return estado === statusFilter;
      });
  }, [items, searchTerm, clasificacionFilter, statusFilter]);

  const handleClearFilters = () => {
    setClasificacionFilter('all');
    setStatusFilter('ALL');
  };

  return (
    <div className="space-y-6">
      <ItemHeader onNewItem={() => navigate('/productos/nuevo')} />

      <ItemSearchBar
        value={searchTerm}
        onValueChange={setSearchTerm}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters((prev) => !prev)}
      />

      {showFilters && (
        <div className="animate-in fade-in-50 slide-in-from-top-1">
          <ItemFilters
            clasificacion={clasificacionFilter}
            clasificacionOptions={clasificacionOptions}
            status={statusFilter}
            onClasificacionChange={setClasificacionFilter}
            onStatusChange={setStatusFilter}
            onClear={handleClearFilters}
            onApply={() => setShowFilters(false)}
            onClose={() => setShowFilters(false)}
          />
        </div>
      )}

      {isError ? (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm">
          Hubo un problema al cargar los productos.{' '}
          <button type="button" onClick={() => refetch()} className="underline">
            Intentar nuevamente
          </button>
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-md border p-6 text-sm text-muted-foreground">
          Cargando productos...
        </div>
      ) : (
        <ItemTable items={filteredItems} />
      )}
    </div>
  );
};
