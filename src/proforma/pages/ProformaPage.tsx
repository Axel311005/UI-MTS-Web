import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Plus, Pencil, FileText, Receipt, Filter } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { toast } from "sonner";
import { ProformaApi } from "../api/proforma.api";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Pagination } from "@/shared/components/ui/pagination";
import { ProformaSearchBar } from "../ui/ProformaSearchBar";
import { ProformaFilters } from "../ui/ProformaFilters";
import { useProforma } from "../hook/useProforma";
import type { Proforma } from "../types/proforoma.interface";
import { useQuery } from "@tanstack/react-query";
import { SearchProformasAction } from "../actions/search-proformas-action";
import type { PaginatedResponse } from "@/shared/types/pagination";

export default function ProformasPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
  const limit = pageSize;
  const offset = (page - 1) * pageSize;

  // Leer parámetros de búsqueda/filtros desde la URL
  const codigoLike = searchParams.get("codigoLike")?.trim() || "";
  const codigoProforma = searchParams.get("codigo_proforma")?.trim() || "";
  const clienteNombre = searchParams.get("clienteNombre")?.trim() || "";
  const aseguradoraNombre = searchParams.get("aseguradoraNombre")?.trim() || "";
  const vehiculoPlaca = searchParams.get("vehiculoPlaca")?.trim() || "";
  const vehiculoMarca = searchParams.get("vehiculoMarca")?.trim() || "";
  const numeroTramite = searchParams.get("numeroTramite")?.trim() || "";
  const moneda = searchParams.get("moneda")?.trim() || "";
  const observacionLike = searchParams.get("observacionLike")?.trim() || "";
  const tramiteEstado = searchParams.get("tramiteEstado")?.trim() || "";
  const hasFactura = searchParams.get("hasFactura")?.trim() || "";
  const fechaInicio = searchParams.get("dateFrom")?.trim() || "";
  const fechaFin = searchParams.get("dateTo")?.trim() || "";
  const minTotal = searchParams.get("minTotal")?.trim() || "";
  const maxTotal = searchParams.get("maxTotal")?.trim() || "";

  // Leer IDs desde sessionStorage
  const [clienteId, setClienteId] = useState(() => {
    const stored = sessionStorage.getItem("proforma_filters_clienteId");
    return stored ? stored : "";
  });
  const [aseguradoraId, setAseguradoraId] = useState(() => {
    const stored = sessionStorage.getItem("proforma_filters_aseguradoraId");
    return stored ? stored : "";
  });
  const [monedaId, setMonedaId] = useState(() => {
    const stored = sessionStorage.getItem("proforma_filters_monedaId");
    return stored ? stored : "";
  });
  const [vehiculoId, setVehiculoId] = useState(() => {
    const stored = sessionStorage.getItem("proforma_filters_vehiculoId");
    return stored ? stored : "";
  });
  const [tramiteId, setTramiteId] = useState(() => {
    const stored = sessionStorage.getItem("proforma_filters_tramiteId");
    return stored ? stored : "";
  });

  // Sincronizar IDs con sessionStorage cuando cambien los searchParams
  useEffect(() => {
    const storedClienteId = sessionStorage.getItem(
      "proforma_filters_clienteId"
    );
    if (storedClienteId !== clienteId) setClienteId(storedClienteId || "");
    const storedAseguradoraId = sessionStorage.getItem(
      "proforma_filters_aseguradoraId"
    );
    if (storedAseguradoraId !== aseguradoraId)
      setAseguradoraId(storedAseguradoraId || "");
    const storedMonedaId = sessionStorage.getItem("proforma_filters_monedaId");
    if (storedMonedaId !== monedaId) setMonedaId(storedMonedaId || "");
    const storedVehiculoId = sessionStorage.getItem(
      "proforma_filters_vehiculoId"
    );
    if (storedVehiculoId !== vehiculoId) setVehiculoId(storedVehiculoId || "");
    const storedTramiteId = sessionStorage.getItem(
      "proforma_filters_tramiteId"
    );
    if (storedTramiteId !== tramiteId) setTramiteId(storedTramiteId || "");
  }, [searchParams]);

  const hasAnyFilter = useMemo(
    () =>
      [
        codigoLike,
        codigoProforma,
        clienteNombre,
        clienteId,
        aseguradoraNombre,
        aseguradoraId,
        vehiculoPlaca,
        vehiculoMarca,
        vehiculoId,
        numeroTramite,
        tramiteId,
        moneda,
        monedaId,
        observacionLike,
        tramiteEstado,
        hasFactura,
        fechaInicio,
        fechaFin,
        minTotal,
        maxTotal,
      ].some((v) => v !== undefined && v !== null && String(v).trim() !== ""),
    [
      codigoLike,
      codigoProforma,
      clienteNombre,
      clienteId,
      aseguradoraNombre,
      aseguradoraId,
      vehiculoPlaca,
      vehiculoMarca,
      vehiculoId,
      numeroTramite,
      tramiteId,
      moneda,
      monedaId,
      observacionLike,
      tramiteEstado,
      hasFactura,
      fechaInicio,
      fechaFin,
      minTotal,
      maxTotal,
    ]
  );

  const {
    proformas,
    totalItems: totalProformas = 0,
    isLoading,
  } = useProforma({
    usePagination: !hasAnyFilter,
    limit: !hasAnyFilter ? limit : undefined,
    offset: !hasAnyFilter ? offset : undefined,
  });

  const { data: proformasFiltradasResponse, isLoading: isLoadingSearch } =
    useQuery<PaginatedResponse<Proforma>>({
      queryKey: [
        "proformas.search",
        codigoLike,
        codigoProforma,
        clienteNombre,
        clienteId,
        aseguradoraNombre,
        aseguradoraId,
        vehiculoPlaca,
        vehiculoMarca,
        vehiculoId,
        numeroTramite,
        tramiteId,
        moneda,
        monedaId,
        observacionLike,
        tramiteEstado,
        hasFactura,
        fechaInicio,
        fechaFin,
        minTotal,
        maxTotal,
        limit,
        offset,
      ],
      queryFn: () =>
        SearchProformasAction({
          codigo_proforma: codigoProforma || undefined,
          codigoLike: codigoLike || undefined,
          clienteNombre: clienteNombre || undefined,
          id_cliente: clienteId ? Number(clienteId) : undefined,
          aseguradoraNombre: aseguradoraNombre || undefined,
          id_aseguradora: aseguradoraId ? Number(aseguradoraId) : undefined,
          vehiculoPlaca: vehiculoPlaca || undefined,
          vehiculoMarca: vehiculoMarca || undefined,
          id_vehiculo: vehiculoId ? Number(vehiculoId) : undefined,
          numeroTramite: numeroTramite || undefined,
          id_tramite: tramiteId ? Number(tramiteId) : undefined,
          moneda: moneda || undefined,
          id_moneda: monedaId ? Number(monedaId) : undefined,
          observacionLike: observacionLike || undefined,
          tramiteEstado: tramiteEstado || undefined,
          hasFactura: hasFactura ? hasFactura === "true" : undefined,
          dateFrom: fechaInicio || undefined,
          dateTo: fechaFin || undefined,
          minTotal: minTotal || undefined,
          maxTotal: maxTotal || undefined,
          limit,
          offset,
        }),
      enabled: hasAnyFilter,
      staleTime: 1000 * 60 * 5,
    });

  const proformasFiltradas = useMemo(() => {
    if (!proformasFiltradasResponse) return [];
    if (Array.isArray(proformasFiltradasResponse))
      return proformasFiltradasResponse;
    return proformasFiltradasResponse.data || [];
  }, [proformasFiltradasResponse]);

  const totalFiltradas = useMemo(() => {
    if (!proformasFiltradasResponse) return 0;
    if (Array.isArray(proformasFiltradasResponse))
      return proformasFiltradasResponse.length;
    return proformasFiltradasResponse.total || 0;
  }, [proformasFiltradasResponse]);

  const proformasFinales = hasAnyFilter ? proformasFiltradas : proformas;
  const totalFinal = hasAnyFilter ? totalFiltradas : totalProformas;
  const isLoadingFinal = hasAnyFilter ? isLoadingSearch : isLoading;

  useEffect(() => {
    if (isLoadingFinal) return;
    const computedTotal = totalFinal ? Math.ceil(totalFinal / pageSize) : 1;
    if (totalFinal === 0) {
      if (page !== 1) {
        const params = new URLSearchParams(searchParams);
        params.delete("page");
        setSearchParams(params, { replace: true });
      }
      return;
    }
    if (page > computedTotal) {
      const last = Math.max(1, computedTotal);
      const params = new URLSearchParams(searchParams);
      if (last > 1) params.set("page", last.toString());
      else params.delete("page");
      setSearchParams(params, { replace: true });
    }
  }, [
    isLoadingFinal,
    page,
    pageSize,
    searchParams,
    setSearchParams,
    totalFinal,
  ]);

  const handleGenerarPDF = async (id: number) => {
    try {
      const dismiss = toast.loading("Generando PDF...");
      const response = await ProformaApi.get(`/${id}/proforma-pdf`, {
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const urlBlob = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = urlBlob;
      const proforma = proformasFinales.find((p) => p.idProforma === id);
      link.download = `proforma-${proforma?.codigoProforma || id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(urlBlob);
      toast.dismiss(dismiss);
      toast.success("PDF generado correctamente");
    } catch (error: any) {
      const message = error?.response?.data?.message || "Error al generar PDF";
      toast.error(message);
    }
  };

  const handleGenerarFactura = (proformaId: number) => {
    // Validar que el proformaId sea válido antes de navegar
    if (!Number.isFinite(proformaId) || proformaId <= 0) {
      toast.error('Error: ID de proforma inválido');
      return;
    }

    // Navegar con el parámetro en la URL Y en el estado (por si acaso)
    const url = `/admin/facturas/from-proforma?proformaId=${proformaId}`;

    // Pasar el proformaId tanto en la URL como en el estado de navegación
    navigate(url, {
      state: { proformaId },
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Proformas</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-0.5 sm:mt-1">Gestión de proformas</p>
        </div>
        <Button 
          onClick={() => navigate("/admin/proformas/nueva")}
          className="w-full sm:w-auto h-10 sm:h-11 text-sm sm:text-base touch-manipulation min-h-[44px]"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nueva Proforma
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <ProformaSearchBar
          containerClassName="w-full max-w-md"
          className="w-full"
        />
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          {showFilters ? "Ocultar" : "Mostrar"} Filtros
        </Button>
      </div>

      {showFilters && <ProformaFilters onClose={() => setShowFilters(false)} />}

      <Card className="card-elegant">
        <CardHeader>
          <CardTitle>Lista de Proformas</CardTitle>
          <CardDescription>Todas las proformas del sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trámite</TableHead>
                <TableHead>Consecutivo</TableHead>
                <TableHead>Moneda</TableHead>
                <TableHead data-mobile-keep>Total</TableHead>
                <TableHead>Observaciones</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingFinal && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-sm">
                    Cargando proformas...
                  </TableCell>
                </TableRow>
              )}
              {!isLoadingFinal && proformasFinales.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-sm text-muted-foreground"
                  >
                    No se encontraron proformas
                  </TableCell>
                </TableRow>
              )}
              {!isLoadingFinal &&
                proformasFinales.map((p) => {
                  const total = Number(p.totalEstimado ?? 0);
                  const monedaName = (
                    p.moneda?.descripcion ?? ""
                  ).toUpperCase();
                  const formattedTotal = (() => {
                    if (!Number.isFinite(total)) return "—";
                    if (monedaName === "DOLARES") {
                      return new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                        maximumFractionDigits: 2,
                      }).format(total);
                    }
                    if (monedaName === "CORDOBAS") {
                      return new Intl.NumberFormat("es-NI", {
                        style: "currency",
                        currency: "NIO",
                        maximumFractionDigits: 2,
                      }).format(total);
                    }
                    return new Intl.NumberFormat("es-ES", {
                      style: "currency",
                      currency: "USD",
                      maximumFractionDigits: 2,
                    }).format(total);
                  })();
                  return (
                    <TableRow key={p.idProforma} className="table-row-hover">
                      <TableCell className="font-medium">
                        {p.tramiteSeguro?.numeroTramite ?? "—"}
                      </TableCell>
                      <TableCell>
                        {p.consecutivo?.descripcion ?? p.codigoProforma ?? "—"}
                      </TableCell>
                      <TableCell>{p.moneda?.descripcion ?? "—"}</TableCell>
                      <TableCell data-mobile-keep>{formattedTotal}</TableCell>
                      <TableCell>{p.observaciones ?? "—"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleGenerarPDF(p.idProforma)}
                            title="Generar PDF"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              navigate(`/proformas/editar/${p.idProforma}`)
                            }
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleGenerarFactura(p.idProforma)}
                            title="Generar Factura"
                          >
                            <Receipt className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </CardContent>
        {totalFinal > 0 && (
          <Pagination
            currentPage={page}
            totalPages={Math.max(1, Math.ceil(totalFinal / pageSize))}
            totalItems={totalFinal}
            pageSize={pageSize}
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
