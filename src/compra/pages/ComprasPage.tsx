import { lazy, Suspense, useMemo, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Plus, Filter } from "@/shared/icons";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { CompraSearch } from "../ui/CompraSearch";
import { Pagination } from "@/shared/components/ui/pagination";
import { CompraFilters } from "../ui/CompraFilters";
import { useCompra } from "../hooks/useCompra";
import { formatDate, formatMoney } from "@/shared/utils/formatters";
import { useQuery } from "@tanstack/react-query";
import { SearchComprasAction } from "../actions/search-compras-action";
import type { PaginatedResponse } from "@/shared/types/pagination";

const CompraRowActions = lazy(() => import("../ui/CompraRowActions"));

export function ComprasPage() {
  const [showFilters, setShowFilters] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Leer parámetros de paginación de la URL o usar valores por defecto
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
  const limit = pageSize;
  const offset = (page - 1) * pageSize;

  // Lectura completa de filtros compatibles con backend
  const codigoLike = (searchParams.get("codigoLike") || "").trim();
  const codigo_compra = (searchParams.get("codigo_compra") || "").trim();
  const estado = (searchParams.get("estado") || "").trim();
  const anulado = (searchParams.get("anulado") || "").trim();
  const bodegaNombre = (searchParams.get("bodegaNombre") || "").trim();
  const empleadoNombre = (searchParams.get("empleadoNombre") || "").trim();
  const tipo_pago = (searchParams.get("tipo_pago") || "").trim();
  const moneda = (searchParams.get("moneda") || "").trim();
  const id_bodega = (searchParams.get("id_bodega") || "").trim();
  // Leer empleadoId desde sessionStorage (no se muestra en URL)
  const [empleadoId, setEmpleadoId] = useState(() => {
    const stored = sessionStorage.getItem("compra_filters_empleadoId");
    return stored ? stored : "";
  });
  const id_empleado =
    empleadoId || (searchParams.get("id_empleado") || "").trim();
  const id_tipo_pago = (searchParams.get("id_tipo_pago") || "").trim();
  const id_moneda = (searchParams.get("id_moneda") || "").trim();

  // Sincronizar con sessionStorage cuando cambien los searchParams (para detectar cambios desde CompraFilters)
  useEffect(() => {
    const storedEmpleadoId = sessionStorage.getItem(
      "compra_filters_empleadoId"
    );
    if (storedEmpleadoId !== empleadoId) {
      setEmpleadoId(storedEmpleadoId || "");
    }
    // Limpiar el parámetro _refresh si existe (no debe mostrarse en la URL)
    if (searchParams.has("_refresh")) {
      const sp = new URLSearchParams(searchParams);
      sp.delete("_refresh");
      setSearchParams(sp, { replace: true });
    }
  }, [searchParams, empleadoId, setSearchParams]);
  const dateFrom = searchParams.get("dateFrom") || "";
  const dateTo = searchParams.get("dateTo") || "";
  const minTotal = searchParams.get("minTotal") || "";
  const maxTotal = searchParams.get("maxTotal") || "";
  const sortBy = (searchParams.get("sortBy") || "fecha") as
    | "fecha"
    | "total"
    | "codigo_compra"
    | "bodega"
    | "empleado"
    | "tipo_pago"
    | "moneda";
  const sortDir = (searchParams.get("sortDir") || "DESC") as "ASC" | "DESC";

  const hasAnyFilter = useMemo(
    () =>
      [
        codigoLike,
        codigo_compra,
        estado,
        anulado,
        bodegaNombre,
        empleadoNombre,
        tipo_pago,
        moneda,
        id_bodega,
        id_empleado,
        id_tipo_pago,
        id_moneda,
        dateFrom,
        dateTo,
        minTotal,
        maxTotal,
      ].some((v) => (v ?? "").toString().trim() !== ""),
    [
      codigoLike,
      codigo_compra,
      estado,
      anulado,
      bodegaNombre,
      empleadoNombre,
      tipo_pago,
      moneda,
      id_bodega,
      id_empleado,
      id_tipo_pago,
      id_moneda,
      dateFrom,
      dateTo,
      minTotal,
      maxTotal,
    ]
  );

  const { compras, totalItems: totalCompras = 0 } = useCompra({
    usePagination: !hasAnyFilter,
    limit: !hasAnyFilter ? limit : undefined,
    offset: !hasAnyFilter ? offset : undefined,
  });

  const { data: comprasFiltradasResponse } = useQuery<PaginatedResponse<any>>({
    queryKey: [
      "compras.search",
      codigoLike,
      codigo_compra,
      estado,
      anulado,
      bodegaNombre,
      empleadoNombre,
      tipo_pago,
      moneda,
      id_bodega,
      id_empleado,
      id_tipo_pago,
      id_moneda,
      dateFrom,
      dateTo,
      minTotal,
      maxTotal,
      limit,
      offset,
      sortBy,
      sortDir,
    ],
    queryFn: () =>
      SearchComprasAction({
        codigo_compra: codigo_compra || undefined,
        codigoLike: codigoLike || undefined,
        estado: estado || undefined,
        anulado: anulado || undefined,
        bodegaNombre: bodegaNombre || undefined,
        empleadoNombre: empleadoNombre || undefined,
        tipo_pago: tipo_pago || undefined,
        moneda: moneda || undefined,
        id_bodega: id_bodega || undefined,
        id_empleado: id_empleado || undefined,
        id_tipo_pago: id_tipo_pago || undefined,
        id_moneda: id_moneda || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        minTotal: minTotal || undefined,
        maxTotal: maxTotal || undefined,
        limit,
        offset,
        sortBy,
        sortDir,
      }),
    enabled: hasAnyFilter,
    staleTime: 1000 * 60 * 5,
  });

  const comprasFiltradas = useMemo(() => {
    if (!comprasFiltradasResponse) return [];
    if (Array.isArray(comprasFiltradasResponse))
      return comprasFiltradasResponse;
    return comprasFiltradasResponse.data || [];
  }, [comprasFiltradasResponse]);

  const totalFiltradas = useMemo(() => {
    if (!comprasFiltradasResponse) return 0;
    if (Array.isArray(comprasFiltradasResponse))
      return comprasFiltradasResponse.length;
    return comprasFiltradasResponse.total ?? 0;
  }, [comprasFiltradasResponse]);

  const rows = hasAnyFilter ? comprasFiltradas : compras;
  const totalRows = hasAnyFilter ? totalFiltradas : totalCompras;
  const totalPages = Math.ceil(totalRows / pageSize);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-left">
            Compras
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gestiona las compras y órdenes de compra
          </p>
        </div>
        <Button
          className="button-hover w-full sm:w-auto"
          onClick={() => navigate("/admin/compras/nueva")}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Compra
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
        <CompraSearch className="w-full sm:max-w-sm" placeholder="Buscar por código" />
        <Button
          variant={showFilters ? "default" : "outline"}
          onClick={() => setShowFilters((s) => !s)}
          className="whitespace-nowrap w-full sm:w-auto"
        >
          <Filter className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">
            {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
          </span>
          <span className="sm:hidden">
            {showFilters ? "Ocultar" : "Filtros"}
          </span>
        </Button>
      </div>

      {showFilters && (
        <div>
          <CompraFilters onClose={() => setShowFilters(false)} />
        </div>
      )}

      <Card className="card-elegant">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">Lista de Compras</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
          <div className="rounded-md border max-h-[480px] overflow-y-auto overflow-x-auto -mx-2 sm:mx-0">
            <div className="min-w-full inline-block">
              <Table minTableWidth="72rem">
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead data-mobile-hidden>Bodega</TableHead>
                  <TableHead data-mobile-hidden>Moneda</TableHead>
                  <TableHead data-mobile-keep>Total</TableHead>
                  <TableHead data-mobile-keep>Estado</TableHead>
                  <TableHead data-mobile-hidden>Tipo Pago</TableHead>
                  <TableHead className="text-right" data-mobile-keep data-mobile-actions>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((compra) => (
                  <TableRow key={compra.idCompra} className="table-row-hover">
                    <TableCell className="font-medium">
                      {compra.codigoCompra}
                    </TableCell>
                    <TableCell>{formatDate(compra.fecha)}</TableCell>
                    <TableCell data-mobile-hidden>{compra.bodega?.descripcion ?? "—"}</TableCell>
                    <TableCell data-mobile-hidden>{compra.moneda?.descripcion ?? "—"}</TableCell>
                    <TableCell className="font-semibold" data-mobile-keep>
                      {formatMoney(compra.total)}
                    </TableCell>
                    <TableCell data-mobile-keep>
                      <Badge
                        variant={
                          (compra.estado ?? "").toString().toUpperCase() ===
                          "COMPLETADA"
                            ? "default"
                            : (compra.estado ?? "").toString().toUpperCase() ===
                              "ANULADA"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {compra.estado}
                      </Badge>
                    </TableCell>
                    <TableCell data-mobile-hidden>{compra.tipoPago?.descripcion ?? "—"}</TableCell>
                    <TableCell className="text-right" data-mobile-keep data-mobile-actions>
                      <Suspense
                        fallback={
                          <div className="text-xs text-muted-foreground">…</div>
                        }
                      >
                        <CompraRowActions compra={compra} />
                      </Suspense>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          </div>
        </CardContent>
        {totalRows > 0 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalRows}
            onPageChange={(newPage) => {
              const params = new URLSearchParams(searchParams);
              if (newPage > 1) {
                params.set("page", newPage.toString());
              } else {
                params.delete("page");
              }
              setSearchParams(params, { replace: true });
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onPageSizeChange={(newSize) => {
              const params = new URLSearchParams(searchParams);
              params.delete("page"); // Reset a página 1
              if (newSize !== 10) {
                params.set("pageSize", newSize.toString());
              } else {
                params.delete("pageSize");
              }
              setSearchParams(params, { replace: true });
            }}
          />
        )}
      </Card>
    </div>
  );
}
