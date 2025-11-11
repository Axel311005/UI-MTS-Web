import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Button } from "@/shared/components/ui/button";
import { Pagination } from "@/shared/components/ui/pagination";
import { useVehiculo } from "../hook/useVehiculo";
import type { Vehiculo } from "../types/vehiculo.interface";
import type { PaginatedResponse } from "@/shared/types/pagination";
import { VehiculoSearch } from "../ui/VehiculoSearch";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { patchVehiculoAction } from "../actions/patch-vehiculo";
import { EstadoActivo } from "@/shared/types/status";
import { useDebounce } from "@/shared/hooks/use-debounce";
import { getClienteNombre } from "@/clientes/utils/cliente.utils";
import { SearchVehiculosAction } from "../actions/search-vehiculos-action";

export const VehiculosPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
  const limit = pageSize;
  const offset = (page - 1) * pageSize;

  const [deletingId, setDeletingId] = useState<number | null>(null);

  const query = (searchParams.get("q") || "").trim();
  const debouncedQuery = useDebounce(query, 300);
  const hasSearch = debouncedQuery.length > 0;

  const {
    vehiculos = [],
    totalItems = 0,
    isLoading,
    refetch,
  } = useVehiculo({
    usePagination: !hasSearch,
    limit: !hasSearch ? limit : undefined,
    offset: !hasSearch ? offset : undefined,
  });

  // Búsqueda usando el backend cuando hay término de búsqueda
  const { data: vehiculosFiltradosResponse, isLoading: isLoadingSearch } =
    useQuery<PaginatedResponse<Vehiculo>>({
      queryKey: ["vehiculos.search", debouncedQuery, limit, offset],
      queryFn: () =>
        SearchVehiculosAction({
          q: debouncedQuery,
          limit,
          offset,
        }),
      enabled: hasSearch,
      staleTime: 1000 * 60 * 5,
    });

  const vehiculosFiltrados = useMemo(() => {
    if (!vehiculosFiltradosResponse) return [];
    if (Array.isArray(vehiculosFiltradosResponse))
      return vehiculosFiltradosResponse;
    return vehiculosFiltradosResponse.data || [];
  }, [vehiculosFiltradosResponse]);

  const totalFiltrados = useMemo(() => {
    if (!hasSearch) return totalItems;
    if (!vehiculosFiltradosResponse) return 0;
    if (Array.isArray(vehiculosFiltradosResponse))
      return vehiculosFiltradosResponse.length;
    return vehiculosFiltradosResponse.total ?? 0;
  }, [hasSearch, totalItems, vehiculosFiltradosResponse]);

  // Determinar qué vehículos mostrar
  const displayedVehiculos = useMemo(() => {
    if (hasSearch) return vehiculosFiltrados;
    return vehiculos;
  }, [hasSearch, vehiculosFiltrados, vehiculos]);

  const isLoadingData = hasSearch ? isLoadingSearch : isLoading;

  useEffect(() => {
    if (isLoadingData) return;
    const computedTotalPages = totalFiltrados
      ? Math.ceil(totalFiltrados / pageSize)
      : 1;

    if (totalFiltrados === 0) {
      if (page !== 1) {
        const params = new URLSearchParams(searchParams);
        params.delete("page");
        setSearchParams(params, { replace: true });
      }
      return;
    }

    if (page > computedTotalPages) {
      const params = new URLSearchParams(searchParams);
      if (computedTotalPages > 1) {
        params.set("page", computedTotalPages.toString());
      } else {
        params.delete("page");
      }
      setSearchParams(params, { replace: true });
    }
  }, [
    isLoadingData,
    page,
    pageSize,
    searchParams,
    setSearchParams,
    totalFiltrados,
  ]);

  const handleDelete = async (idVehiculo: number, placa: string) => {
    if (deletingId) return;
    const confirmDelete = window.confirm(
      `¿Eliminar el vehículo ${placa}? Se marcará como inactivo.`
    );
    if (!confirmDelete) return;
    try {
      setDeletingId(idVehiculo);
      await patchVehiculoAction(idVehiculo, {
        activo: EstadoActivo.INACTIVO,
      });
      toast.success("Vehículo eliminado");
      await refetch();
    } catch (error) {
      toast.error("No se pudo eliminar el vehículo");
    } finally {
      setDeletingId(null);
    }
  };

  const totalPages =
    totalFiltrados > 0 ? Math.ceil(totalFiltrados / pageSize) : 1;
  const showEmptyState = !isLoadingData && totalFiltrados === 0;

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-left">Vehículos</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Listado de vehículos registrados
          </p>
        </div>
        <Button 
          className="w-full sm:w-auto h-10 sm:h-11 text-sm sm:text-base touch-manipulation min-h-[44px]" 
          onClick={() => navigate("/admin/vehiculos/nuevo")}
        >
          Nuevo vehículo
        </Button>
      </div>

      <VehiculoSearch />
      <Card className="card-elegant">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="text-lg sm:text-xl">Lista de Vehículos</CardTitle>
            <div className="w-full max-w-sm"></div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
          <div className="rounded-md border max-h-[600px] overflow-y-auto overflow-x-auto -mx-2 sm:mx-0">
            <div className="min-w-full inline-block">
              <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Placa</TableHead>
                <TableHead data-mobile-keep>Marca</TableHead>
                <TableHead data-mobile-hidden>Modelo</TableHead>
                <TableHead data-mobile-hidden>Año</TableHead>
                <TableHead data-mobile-hidden>Color</TableHead>
                <TableHead data-mobile-hidden>Cliente</TableHead>
                <TableHead data-mobile-keep>Estado</TableHead>
                <TableHead className="text-right" data-mobile-keep data-mobile-actions>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedVehiculos.map((v) => (
                <TableRow key={v.idVehiculo} className="table-row-hover">
                  <TableCell className="font-medium">{v.placa}</TableCell>
                  <TableCell data-mobile-keep>{v.marca || "—"}</TableCell>
                  <TableCell data-mobile-hidden>{v.modelo || "—"}</TableCell>
                  <TableCell data-mobile-hidden>{v.anio ?? "—"}</TableCell>
                  <TableCell data-mobile-hidden>{v.color || "—"}</TableCell>
                  <TableCell data-mobile-hidden>
                    {v.cliente ? getClienteNombre(v.cliente) : "—"}
                  </TableCell>
                  <TableCell data-mobile-keep>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        v.activo === EstadoActivo.ACTIVO
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}
                    >
                      {v.activo === EstadoActivo.ACTIVO ? "Activo" : "Inactivo"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right" data-mobile-keep data-mobile-actions>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          navigate(`/admin/vehiculos/${v.idVehiculo}/editar`)
                        }
                      >
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Eliminar ${v.placa}`}
                        onClick={() => handleDelete(v.idVehiculo, v.placa)}
                        disabled={deletingId === v.idVehiculo}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {showEmptyState && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-24 text-center text-sm text-muted-foreground"
                  >
                    No se encontraron vehículos.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
            </div>
          </div>
        </CardContent>
        {totalFiltrados > 0 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalFiltrados}
            onPageChange={(newPage) => {
              const params = new URLSearchParams(searchParams);
              if (newPage > 1) params.set("page", newPage.toString());
              else params.delete("page");
              setSearchParams(params, { replace: true });
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onPageSizeChange={(newSize) => {
              const params = new URLSearchParams(searchParams);
              params.delete("page");
              if (newSize !== 10) params.set("pageSize", newSize.toString());
              else params.delete("pageSize");
              setSearchParams(params, { replace: true });
            }}
          />
        )}
      </Card>
    </div>
  );
};

export default VehiculosPage;
