import { useMemo, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/shared/components/ui/button";
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
import { Badge } from "@/shared/components/ui/badge";
import { Pagination } from "@/shared/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useCita } from "../hook/useCita";
import { CitaSearchBar } from "../ui/CitaSearchBar";
import type { Cita } from "../types/cita.interface";
import { useDebounce } from "@/shared/hooks/use-debounce";
import { CitaEstado } from "@/shared/types/status";
import { getClienteNombre } from "@/clientes/utils/cliente.utils";
import { SearchCitasAction } from "../actions/search-citas-action";
import type { PaginatedResponse } from "@/shared/types/pagination";
import { CitaRowActions } from "../ui/CitaRowActions";

const estadoVariant: Record<
  CitaEstado,
  "default" | "secondary" | "outline" | "destructive"
> = {
  [CitaEstado.PROGRAMADA]: "default",
  [CitaEstado.CONFIRMADA]: "secondary",
  [CitaEstado.EN_PROCESO]: "outline",
  [CitaEstado.FINALIZADA]: "default",
  [CitaEstado.CANCELADA]: "destructive",
};

const formatDate = (value?: string | Date | null) => {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  return d instanceof Date && !Number.isNaN(d.getTime())
    ? d.toLocaleString("es-ES", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";
};

export default function CitasPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialSearch = searchParams.get("q") || "";
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const estadoFilter = searchParams.get("estado") || "";

  useEffect(() => {
    const currentParam = searchParams.get("q") || "";
    if (currentParam !== searchTerm) {
      setSearchTerm(currentParam);
    }
  }, [searchParams, searchTerm]);

  const debouncedSearch = useDebounce(searchTerm.trim(), 300);

  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
  const limit = pageSize;
  const offset = (page - 1) * pageSize;
  const hasSearch = Boolean(
    debouncedSearch.length > 0 || (estadoFilter && estadoFilter !== "all")
  );

  const {
    citas = [],
    totalItems = 0,
    isLoading,
  } = useCita({
    usePagination: !hasSearch,
    limit: !hasSearch ? limit : undefined,
    offset: !hasSearch ? offset : undefined,
  });

  // Búsqueda usando el backend cuando hay término de búsqueda o filtro de estado
  const { data: citasFiltradasResponse, isLoading: isLoadingSearch } = useQuery<
    PaginatedResponse<Cita>
  >({
    queryKey: ["citas.search", debouncedSearch, estadoFilter, limit, offset],
    queryFn: () =>
      SearchCitasAction({
        q: debouncedSearch || undefined,
        estado:
          estadoFilter && estadoFilter !== "all"
            ? (estadoFilter as CitaEstado)
            : undefined,
        limit,
        offset,
      }),
    enabled: hasSearch,
    staleTime: 1000 * 60 * 5,
  });

  const citasFiltradas = useMemo(() => {
    if (!citasFiltradasResponse) return [];
    if (Array.isArray(citasFiltradasResponse)) return citasFiltradasResponse;
    return citasFiltradasResponse.data || [];
  }, [citasFiltradasResponse]);

  const totalFiltrados = useMemo(() => {
    if (!hasSearch) return totalItems;
    if (!citasFiltradasResponse) return 0;
    if (Array.isArray(citasFiltradasResponse))
      return citasFiltradasResponse.length;
    return citasFiltradasResponse.total ?? 0;
  }, [hasSearch, totalItems, citasFiltradasResponse]);

  // Determinar qué citas mostrar
  const displayedCitas = useMemo(() => {
    if (hasSearch) return citasFiltradas;
    return citas;
  }, [hasSearch, citasFiltradas, citas]);

  const isLoadingData = hasSearch ? isLoadingSearch : isLoading;

  const totalPages = totalFiltrados ? Math.ceil(totalFiltrados / pageSize) : 1;
  const showEmpty = !isLoadingData && totalFiltrados === 0;

  // Sincronizar página con URL cuando cambian los datos
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
      const lastPage = Math.max(1, computedTotalPages);
      const params = new URLSearchParams(searchParams);
      if (lastPage > 1) {
        params.set("page", lastPage.toString());
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

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-left">Citas</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gestión de citas agendadas por clientes
          </p>
        </div>
        <Button className="w-full sm:w-auto" onClick={() => navigate("/admin/citas/nueva")}>
          <Plus className="mr-2 h-4 w-4" /> Nueva Cita
        </Button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <CitaSearchBar
          containerClassName="w-full max-w-md"
          className="w-full"
          placeholder="Buscar por cliente, vehículo, motivo o canal"
        />
        <Select
          value={estadoFilter || "all"}
          onValueChange={(value) => {
            const params = new URLSearchParams(searchParams);
            if (value && value !== "all") {
              params.set("estado", value);
            } else {
              params.delete("estado");
            }
            params.delete("page"); // Resetear a página 1
            setSearchParams(params, { replace: true });
          }}
        >
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            {Object.values(CitaEstado).map((estado) => (
              <SelectItem key={estado} value={estado}>
                {estado.replace("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="card-elegant">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">Lista de Citas</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
          <div className="rounded-md border max-h-[600px] overflow-y-auto overflow-x-auto -mx-2 sm:mx-0">
            <div className="min-w-full inline-block">
              <Table>
            <TableHeader>
              <TableRow>
                <TableHead data-mobile-keep>Cliente</TableHead>
                <TableHead data-mobile-hidden>Vehículo</TableHead>
                <TableHead data-mobile-hidden>Motivo</TableHead>
                <TableHead data-mobile-keep>Fecha Inicio</TableHead>
                <TableHead data-mobile-hidden>Fecha Fin</TableHead>
                <TableHead data-mobile-hidden>Canal</TableHead>
                <TableHead data-mobile-keep>Estado</TableHead>
                <TableHead
                  className="w-0 text-right"
                  data-mobile-keep
                  data-mobile-actions
                >
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingData && (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-sm">
                    Cargando citas...
                  </TableCell>
                </TableRow>
              )}
              {!isLoadingData &&
                displayedCitas.map((cita: Cita) => (
                  <TableRow key={cita.idCita} className="table-row-hover">
                    <TableCell className="font-medium" data-mobile-keep>
                      {cita.cliente ? getClienteNombre(cita.cliente) : "—"}
                    </TableCell>
                    <TableCell data-mobile-hidden>
                      {cita.vehiculo?.placa
                        ? `${cita.vehiculo.placa} — ${cita.vehiculo.marca} ${cita.vehiculo.modelo}`
                        : "—"}
                    </TableCell>
                    <TableCell data-mobile-hidden>
                      {cita.motivoCita?.descripcion ?? "—"}
                    </TableCell>
                    <TableCell data-mobile-keep>
                      {formatDate(cita.fechaInicio)}
                    </TableCell>
                    <TableCell data-mobile-hidden>
                      {formatDate(cita.fechaFin)}
                    </TableCell>
                    <TableCell className="uppercase" data-mobile-hidden>
                      {cita.canal ?? "—"}
                    </TableCell>
                    <TableCell data-mobile-keep>
                      {cita.estado ? (
                        <Badge
                          variant={
                            estadoVariant[cita.estado as CitaEstado] ??
                            "outline"
                          }
                        >
                          {cita.estado.replace("_", " ")}
                        </Badge>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell
                      className="text-right"
                      data-mobile-keep
                      data-mobile-actions
                    >
                      <div className="flex w-full justify-end">
                        <CitaRowActions cita={cita} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              {showEmpty && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-24 text-center text-sm text-muted-foreground"
                  >
                    No se encontraron citas.
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
}
