import { lazy, Suspense, useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Plus } from "@/shared/icons";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Pagination } from "@/shared/components/ui/pagination";
import { Filter } from "@/shared/icons";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Badge } from "@/shared/components/ui/badge";
import { FacturaSearch } from "../ui/FacturaSearch";
import { FacturaFilters } from "../ui/FacturaFilters";
import { formatDate, formatMoney } from "@/shared/utils/formatters";
import { useFactura } from "../hooks/useFactura";
import { useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { SearchFacturaAction } from "../actions/search-facturas-action";
import type { Factura } from "../types/Factura.interface";
import { getClienteNombre } from "@/clientes/utils/cliente.utils";
import type { PaginatedResponse } from "@/shared/types/pagination";

const FacturaRowActions = lazy(() => import("../ui/FacturaRowActions"));

export const FacturasPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Leer parámetros de URL o usar valores por defecto
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);

  const limit = pageSize;
  const offset = (page - 1) * pageSize;

  // Leer parámetros de búsqueda/filtros desde la URL
  const codigoLike = searchParams.get("codigoLike")?.trim() || "";
  const codigoFactura = searchParams.get("codigo_factura")?.trim() || "";
  const estado = searchParams.get("estado")?.trim() || "";
  const bodegaNombre = searchParams.get("bodegaNombre")?.trim() || "";
  // Leer IDs desde sessionStorage (no se muestran en URL)
  // Usar un estado que se actualice cuando cambien los searchParams (para forzar re-render)
  const [clienteId, setClienteId] = useState(() => {
    const stored = sessionStorage.getItem("factura_filters_clienteId");
    return stored ? stored : "";
  });
  const [empleadoId, setEmpleadoId] = useState(() => {
    const stored = sessionStorage.getItem("factura_filters_empleadoId");
    return stored ? stored : "";
  });
  const [monedaId, setMonedaId] = useState(() => {
    const stored = sessionStorage.getItem("factura_filters_monedaId");
    return stored ? stored : "";
  });
  const [tipoPagoId, setTipoPagoId] = useState(() => {
    const stored = sessionStorage.getItem("factura_filters_tipoPagoId");
    return stored ? stored : "";
  });

  // Sincronizar con sessionStorage cuando cambien los searchParams (para detectar cambios desde FacturaFilters)
  useEffect(() => {
    const storedClienteId = sessionStorage.getItem("factura_filters_clienteId");
    const storedEmpleadoId = sessionStorage.getItem(
      "factura_filters_empleadoId"
    );
    const storedMonedaId = sessionStorage.getItem("factura_filters_monedaId");
    const storedTipoPagoId = sessionStorage.getItem(
      "factura_filters_tipoPagoId"
    );
    if (storedClienteId !== clienteId) {
      setClienteId(storedClienteId || "");
    }
    if (storedEmpleadoId !== empleadoId) {
      setEmpleadoId(storedEmpleadoId || "");
    }
    if (storedMonedaId !== monedaId) {
      setMonedaId(storedMonedaId || "");
    }
    if (storedTipoPagoId !== tipoPagoId) {
      setTipoPagoId(storedTipoPagoId || "");
    }
    // Limpiar el parámetro _refresh si existe (no debe mostrarse en la URL)
    if (searchParams.has("_refresh")) {
      const sp = new URLSearchParams(searchParams);
      sp.delete("_refresh");
      setSearchParams(sp, { replace: true });
    }
  }, [
    searchParams,
    clienteId,
    empleadoId,
    monedaId,
    tipoPagoId,
    setSearchParams,
  ]);
  const fechaInicio = searchParams.get("dateFrom")?.trim() || "";
  const fechaFin = searchParams.get("dateTo")?.trim() || "";
  const minTotal = searchParams.get("minTotal")?.trim() || "";
  const maxTotal = searchParams.get("maxTotal")?.trim() || "";

  const hasAnyFilter = useMemo(
    () =>
      [
        codigoLike,
        codigoFactura,
        estado,
        clienteId,
        empleadoId,
        monedaId,
        tipoPagoId,
        bodegaNombre,
        fechaInicio,
        fechaFin,
        minTotal,
        maxTotal,
      ].some((v) => v !== undefined && v !== null && String(v).trim() !== ""),
    [
      codigoLike,
      codigoFactura,
      estado,
      clienteId,
      empleadoId,
      monedaId,
      tipoPagoId,
      bodegaNombre,
      fechaInicio,
      fechaFin,
      minTotal,
      maxTotal,
    ]
  );

  const { facturas, totalItems: totalFacturas = 0 } = useFactura({
    usePagination: !hasAnyFilter,
    limit,
    offset,
  });

  const { data: facturasFiltradasResponse } = useQuery<
    PaginatedResponse<Factura>
  >({
    queryKey: [
      "facturas.search",
      codigoLike,
      codigoFactura,
      estado,
      clienteId,
      empleadoId,
      monedaId,
      tipoPagoId,
      bodegaNombre,
      fechaInicio,
      fechaFin,
      minTotal,
      maxTotal,
      limit,
      offset,
    ],
    queryFn: () =>
      SearchFacturaAction({
        codigoLike,
        codigo_factura: codigoFactura,
        estado,
        clienteId,
        empleadoId,
        monedaId,
        tipoPagoId,
        bodegaNombre,
        dateFrom: fechaInicio,
        dateTo: fechaFin,
        minTotal,
        maxTotal,
        limit,
        offset,
      }),
    enabled: hasAnyFilter,
    staleTime: 1000 * 60 * 5,
  });

  const facturasFiltradas = useMemo(() => {
    if (!facturasFiltradasResponse) return [];
    if (Array.isArray(facturasFiltradasResponse))
      return facturasFiltradasResponse;
    return facturasFiltradasResponse.data || [];
  }, [facturasFiltradasResponse]);

  const totalFiltradas = useMemo(() => {
    if (!facturasFiltradasResponse) return 0;
    if (Array.isArray(facturasFiltradasResponse))
      return facturasFiltradasResponse.length;
    return facturasFiltradasResponse.total ?? 0;
  }, [facturasFiltradasResponse]);

  const [showFilters, setShowFilters] = useState(false);

  const ESTADO_BADGE_VARIANTS: Record<
    string,
    "secondary" | "outline" | "destructive" | "default"
  > = {
    PAGADO: "secondary",
    PENDIENTE: "outline",
    ANULADA: "destructive",
  };

  const normalizeEstado = (raw: string) => raw?.toUpperCase?.() ?? "";

  const getEstadoBadgeVariant = (estadoRaw: string) =>
    ESTADO_BADGE_VARIANTS[normalizeEstado(estadoRaw)] ?? "default";

  const rows = useMemo(() => {
    const data = hasAnyFilter ? facturasFiltradas : facturas;
    if (!Array.isArray(data)) return [];
    return data;
  }, [hasAnyFilter, facturasFiltradas, facturas]);

  const totalRows = hasAnyFilter ? totalFiltradas : totalFacturas;
  const totalPages = totalRows > 0 ? Math.ceil(totalRows / pageSize) : 1;

  // Sincronizar página con URL cuando cambian los datos
  useEffect(() => {
    if (totalRows === 0) {
      if (page !== 1) {
        const params = new URLSearchParams(searchParams);
        params.delete("page");
        setSearchParams(params, { replace: true });
      }
      return;
    }

    const computedTotalPages = Math.ceil(totalRows / pageSize);
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
  }, [totalRows, page, pageSize, searchParams, setSearchParams]);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-left">
            Facturas
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground text-left">
            Gestiona las facturas y documentos de venta
          </p>
        </div>
        <Button
          className="button-hover w-full sm:w-auto"
          onClick={() => navigate("/admin/facturas/nueva")}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Factura
        </Button>
      </div>
      {/* Barra de búsqueda reutilizando componente existente */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
        <FacturaSearch className="w-full sm:max-w-sm" />
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
      {/* Los chips de filtros activos ahora se muestran dentro del panel de filtros */}
      {showFilters && (
        <div>
          <FacturaFilters onClose={() => setShowFilters(false)} />
        </div>
      )}
      <Card className="card-elegant">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">Lista de Facturas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
          <div className="rounded-md border max-h-[480px] overflow-y-auto overflow-x-auto -mx-2 sm:mx-0">
            <div className="min-w-full inline-block">
              <Table minTableWidth="72rem">
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead data-mobile-hidden>Bodega</TableHead>
                  <TableHead data-mobile-hidden>Moneda</TableHead>
                  <TableHead data-mobile-keep>Total</TableHead>
                  <TableHead data-mobile-keep>Estado</TableHead>
                  <TableHead data-mobile-hidden>Tipo Pago</TableHead>
                  <TableHead data-mobile-hidden>Origen</TableHead>
                  <TableHead
                    className="text-right"
                    data-mobile-keep
                    data-mobile-actions
                  >
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((factura) => {
                  const estadoNorm = normalizeEstado(factura.estado);
                  return (
                    <TableRow
                      key={factura.id_factura}
                      className="table-row-hover"
                    >
                      <TableCell className="font-medium">
                        {factura.codigoFactura}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {factura.cliente
                              ? getClienteNombre(factura.cliente)
                              : "—"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {factura.cliente?.ruc}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(factura.fecha)}</TableCell>
                      <TableCell data-mobile-hidden>
                        {factura.bodega?.descripcion ?? "—"}
                      </TableCell>
                      <TableCell data-mobile-hidden>
                        {factura.moneda?.descripcion ?? "—"}
                      </TableCell>
                      <TableCell className="font-semibold" data-mobile-keep>
                        {formatMoney(factura.total)}
                      </TableCell>
                      <TableCell data-mobile-keep>
                        <Badge variant={getEstadoBadgeVariant(estadoNorm)}>
                          {estadoNorm}
                        </Badge>
                      </TableCell>
                      <TableCell data-mobile-hidden>
                        {factura.tipoPago?.descripcion ?? "—"}
                      </TableCell>
                      <TableCell data-mobile-hidden>
                        {factura.proforma ? (
                          <Badge
                            variant="secondary"
                            className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          >
                            Desde Proforma
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            Directa
                          </span>
                        )}
                      </TableCell>
                      <TableCell
                        className="text-right"
                        data-mobile-keep
                        data-mobile-actions
                      >
                        <Suspense
                          fallback={
                            <div className="text-xs text-muted-foreground">
                              …
                            </div>
                          }
                        >
                          <FacturaRowActions factura={factura} />
                        </Suspense>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            </div>
          </div>
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
        </CardContent>
      </Card>
    </div>
  );
};
