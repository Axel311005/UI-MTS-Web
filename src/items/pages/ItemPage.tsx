import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { ItemHeader } from '../ui/ItemHeader';
import { ItemSearchBar } from '../ui/ItemSearchBar';
import { ItemFilters } from '../ui/ItemFilters';
import { ItemTable } from '../ui/ItemTable';
import { useItem } from '../hooks/useItem';
import { Pagination } from '@/shared/components/ui/pagination';
import type { ItemStatusFilter } from '../ui/ItemFilters';
import type { ItemResponse } from '../types/item.response';

export const ItemPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const limit = pageSize;
  const offset = (page - 1) * pageSize;

  const {
    items,
    totalItems = 0,
    isLoading,
    isError,
    refetch,
  } = useItem({
    usePagination: true,
    limit,
    offset,
  });

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
        const estado = item.estado || item.activo;
        return estado === statusFilter;
      });
  }, [items, searchTerm, clasificacionFilter, statusFilter]);

  const handleClearFilters = () => {
    setClasificacionFilter('all');
    setStatusFilter('ALL');
    setPage(1); 
  };

  const totalPages = Math.max(1, totalItems > 0 ? Math.ceil(totalItems / pageSize) : 1);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    // Scroll al inicio de la tabla
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1); // Resetear a primera página al cambiar tamaño
  };

  return (
    <div className="space-y-6">
      <ItemHeader onNewItem={() => navigate('/admin/productos/nuevo')} />

      <ItemSearchBar
        value={searchTerm}
        onValueChange={(value) => {
          setSearchTerm(value);
          setPage(1); // Resetear a primera página al buscar
        }}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters((prev) => !prev)}
      />

      {showFilters && (
        <div>
          <ItemFilters
            clasificacion={clasificacionFilter}
            clasificacionOptions={clasificacionOptions}
            status={statusFilter}
            onClasificacionChange={(value) => {
              setClasificacionFilter(value);
              setPage(1);
            }}
            onStatusChange={(value) => {
              setStatusFilter(value);
              setPage(1);
            }}
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
        <>
          <ItemTable items={filteredItems} />
          {totalItems > 0 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={totalItems}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
        </>
      )}
    </div>
  );
};
