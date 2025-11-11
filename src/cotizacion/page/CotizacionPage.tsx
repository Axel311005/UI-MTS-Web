import { useMemo, useEffect, useState } from "react";
import { useSearchParams } from "react-router";
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
import { Badge } from "@/shared/components/ui/badge";
import { Pagination } from "@/shared/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useCotizacion } from "../hook/useCotizacion";
import { CotizacionSearchBar } from "../ui/CotizacionSearchBar";
import type { Cotizacion } from "../types/cotizacion.interface";
import { useDebounce } from "@/shared/hooks/use-debounce";
import { CotizacionEstado } from "@/shared/types/status";
import { formatMoney } from "@/shared/utils/formatters";
import { getClienteNombre } from "@/clientes/utils/cliente.utils";
import { SearchCotizacionesAction } from "../actions/search-cotizaciones-action";
import type { PaginatedResponse } from "@/shared/types/pagination";
import { CotizacionRowActions } from "../ui/CotizacionRowActions";

const estadoVariant: Record<CotizacionEstado, "default" | "destructive"> = {
  [CotizacionEstado.GENERADA]: "default",
  [CotizacionEstado.CADUCADA]: "destructive",
};

const formatDate = (value?: string | Date | null) => {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  return d instanceof Date && !Number.isNaN(d.getTime())
    ? d.toLocaleDateString("es-ES")
    : "—";
};

export default function CotizacionesPage() {
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
    cotizaciones = [],
    totalItems = 0,
    isLoading,
  } = useCotizacion({
    usePagination: !hasSearch,
    limit: !hasSearch ? limit : undefined,
    offset: !hasSearch ? offset : undefined,
  });

  // Búsqueda usando el backend cuando hay término de búsqueda o filtro de estado
  const { data: cotizacionesFiltradasResponse, isLoading: isLoadingSearch } =
    useQuery<PaginatedResponse<Cotizacion>>({
      queryKey: [
        "cotizaciones.search",
        debouncedSearch,
        estadoFilter,
        limit,
        offset,
      ],
      queryFn: () =>
        SearchCotizacionesAction({
          q: debouncedSearch || undefined,
          estado:
            estadoFilter && estadoFilter !== "all"
              ? (estadoFilter as CotizacionEstado)
              : undefined,
          limit,
          offset,
        }),
      enabled: hasSearch,
      staleTime: 1000 * 60 * 5,
    });

  const cotizacionesFiltradas = useMemo(() => {
    if (!cotizacionesFiltradasResponse) return [];
    if (Array.isArray(cotizacionesFiltradasResponse))
      return cotizacionesFiltradasResponse;
    return cotizacionesFiltradasResponse.data || [];
  }, [cotizacionesFiltradasResponse]);

  const totalFiltrados = useMemo(() => {
    if (!hasSearch) return totalItems;
    if (!cotizacionesFiltradasResponse) return 0;
    if (Array.isArray(cotizacionesFiltradasResponse))
      return cotizacionesFiltradasResponse.length;
    return cotizacionesFiltradasResponse.total ?? 0;
  }, [hasSearch, totalItems, cotizacionesFiltradasResponse]);

  // Determinar qué cotizaciones mostrar
  const displayedCotizaciones = useMemo(() => {
    if (hasSearch) return cotizacionesFiltradas;
    return cotizaciones;
  }, [hasSearch, cotizacionesFiltradas, cotizaciones]);

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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-left">Cotizaciones</h1>
          <p className="text-muted-foreground">
            Gestión de cotizaciones generadas por clientes
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <CotizacionSearchBar
          containerClassName="w-full max-w-md"
          className="w-full"
          placeholder="Buscar por código, cliente, RUC o teléfono"
        />
        <Select
          value={estadoFilter || "all"}
          onValueChange={(value: string) => {
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
            {Object.values(CotizacionEstado).map((estado) => (
              <SelectItem key={estado} value={estado}>
                {estado}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="card-elegant">
        <CardHeader>
          <CardTitle>Lista de Cotizaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead data-mobile-keep>Código</TableHead>
                <TableHead data-mobile-keep>Cliente</TableHead>
                <TableHead data-mobile-hidden>RUC</TableHead>
                <TableHead data-mobile-hidden>Fecha</TableHead>
                <TableHead data-mobile-keep>Total</TableHead>
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
                  <TableCell colSpan={7} className="h-24 text-center text-sm">
                    Cargando cotizaciones...
                  </TableCell>
                </TableRow>
              )}
              {!isLoadingData &&
                displayedCotizaciones.map((cotizacion: Cotizacion) => (
                  <TableRow
                    key={cotizacion.idCotizacion}
                    className="table-row-hover"
                  >
                    <TableCell className="font-medium" data-mobile-keep>
                      {cotizacion.codigoCotizacion ?? "—"}
                    </TableCell>
                    <TableCell data-mobile-keep>
                      {cotizacion.nombreCliente ??
                        (cotizacion.cliente
                          ? getClienteNombre(cotizacion.cliente)
                          : "—")}
                    </TableCell>
                    <TableCell data-mobile-hidden>
                      {cotizacion.cliente?.ruc ?? "—"}
                    </TableCell>
                    <TableCell data-mobile-hidden>
                      {formatDate(cotizacion.fecha)}
                    </TableCell>
                    <TableCell data-mobile-keep>
                      {cotizacion.total
                        ? // Cotizaciones in admin panel should display prices in Córdobas
                          formatMoney(Number(cotizacion.total), 'CORDOBAS')
                        : "—"}
                    </TableCell>
                    <TableCell data-mobile-keep>
                      {cotizacion.estado ? (
                        <Badge
                          variant={
                            estadoVariant[
                              cotizacion.estado as keyof typeof estadoVariant
                            ] ?? "outline"
                          }
                        >
                          {cotizacion.estado}
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
                        <CotizacionRowActions cotizacion={cotizacion} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              {showEmpty && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-sm text-muted-foreground"
                  >
                    No se encontraron cotizaciones.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
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
