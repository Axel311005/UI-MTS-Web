import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Tag } from '@/shared/icons';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Pagination } from '@/shared/components/ui/pagination';
import { ClasificacionHeader } from '../ui/ClasificacionHeader';
import { ClasificacionSearchBar } from '../ui/ClasificacionSearchBar';
import { ClasificacionCard } from '../ui/ClasificacionCard';
import { useClasificacionItem } from '../hook/useClasificacionItem';
import type { ClasificacionItem } from '../types/clasificacionItem.interface';
import { patchClasificacionItem } from '../actions/patch-clasificacion-item';
import { EstadoActivo } from '@/shared/types/status';

export function ClasificacionesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const limit = pageSize;
  const offset = (page - 1) * pageSize;
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const { clasificacionItems, totalItems = 0 } = useClasificacionItem({
    usePagination: true,
    limit,
    offset,
  });
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const filteredClasificaciones = useMemo<ClasificacionItem[]>(() => {
    const items = clasificacionItems ?? [];
    const term = searchTerm.trim().toLowerCase();
    if (!term) return items;

    return items.filter((clasificacion) => {
      const descripcion = clasificacion.descripcion?.toLowerCase() ?? '';
      return descripcion.includes(term);
    });
  }, [clasificacionItems, searchTerm]);

  useEffect(() => {
    const computedTotalPages = Math.max(
      Math.ceil((totalItems || 0) / pageSize),
      1
    );

    if (page > computedTotalPages) {
      setPage(computedTotalPages);
    }
  }, [page, totalItems, pageSize]);

  const handleDelete = async (id: number) => {
    if (deletingId !== null) return;
    const confirmed = window.confirm(
      '¿Deseas marcar esta clasificación como inactiva?'
    );
    if (!confirmed) return;

    setDeletingId(id);
    const dismiss = toast.loading('Actualizando clasificación...');
    try {
      await patchClasificacionItem(id, { activo: EstadoActivo.INACTIVO });
      toast.success('Clasificación desactivada');
      await queryClient.invalidateQueries({
        queryKey: ['clasificacionItems'],
        exact: false,
      });
    } catch (error: any) {
      const raw = error?.response?.data;
      const message =
        raw?.message ||
        (typeof raw === 'string' ? raw : undefined) ||
        (error instanceof Error ? error.message : undefined) ||
        'No se pudo actualizar la clasificación';
      toast.error(message);
    } finally {
      toast.dismiss(dismiss);
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <ClasificacionHeader
        onNewClasificacion={() => navigate('/admin/clasificaciones/nueva')}
      />

      <ClasificacionSearchBar
        value={searchTerm}
        onValueChange={(value) => {
          setSearchTerm(value);
          setPage(1);
        }}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters((prev) => !prev)}
      />

      {showFilters && (
        <div>
          {/* ClasificacionFilters puede agregarse después si se necesita */}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredClasificaciones.map((clasificacion) => (
          <ClasificacionCard
            key={clasificacion.idClasificacion}
            clasificacion={clasificacion}
            onView={(id) => navigate(`/clasificaciones/${id}`)}
            onEdit={(id) => navigate(`/admin/clasificaciones/${id}/editar`)}
            onDelete={handleDelete}
            disableDelete={deletingId === clasificacion.idClasificacion}
          />
        ))}
      </div>

      {filteredClasificaciones.length === 0 && (
        <Card className="card-elegant">
          <CardContent className="text-center py-8">
            <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              No se encontraron clasificaciones
            </h3>
            <p className="text-muted-foreground">
              Intenta ajustar tu búsqueda o crea una nueva clasificación.
            </p>
          </CardContent>
        </Card>
      )}

      {totalItems > 0 && (
        <div className="mt-6">
          <Pagination
            currentPage={page}
            totalPages={Math.max(Math.ceil(totalItems / pageSize), 1)}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={(newPage) => {
              setPage(newPage);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setPage(1);
            }}
          />
        </div>
      )}
    </div>
  );
}
