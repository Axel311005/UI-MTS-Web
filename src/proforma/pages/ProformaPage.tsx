import { useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Plus, Pencil, FileText, Receipt } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { Pagination } from '@/shared/components/ui/pagination';
import { ProformaSearchBar } from '../ui/ProformaSearchBar';
import { useProforma } from '../hook/useProforma';
import type { Proforma } from '../types/proforoma.interface';
import { useDebounce } from '@/shared/hooks/use-debounce';

export default function ProformasPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialSearch = searchParams.get('q') || '';
  const debounced = useDebounce(initialSearch.trim().toLowerCase(), 300);

  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
  const limit = pageSize;
  const offset = (page - 1) * pageSize;
  const shouldUsePagination = debounced.length === 0;

  const {
    proformas = [],
    totalItems = 0,
    isLoading,
  } = useProforma({
    usePagination: shouldUsePagination,
    limit: shouldUsePagination ? limit : undefined,
    offset: shouldUsePagination ? offset : undefined,
  });

  const filtered = useMemo<Proforma[]>(() => {
    const list = proformas ?? [];
    if (!debounced) return list;
    return list.filter((p) => {
      const codigo = p.codigoProforma?.toLowerCase?.() ?? '';
      const tramite = p.tramiteSeguro?.numeroTramite?.toLowerCase?.() ?? '';
      const moneda = p.moneda?.descripcion?.toLowerCase?.() ?? '';
      const obs = p.observaciones?.toLowerCase?.() ?? '';
      return (
        codigo.includes(debounced) ||
        tramite.includes(debounced) ||
        moneda.includes(debounced) ||
        obs.includes(debounced)
      );
    });
  }, [proformas, debounced]);

  const totalFiltered = shouldUsePagination ? totalItems : filtered.length;
  const paginated = useMemo(() => {
    if (shouldUsePagination) return filtered;
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize, shouldUsePagination]);

  useEffect(() => {
    if (isLoading) return;
    const computedTotal = totalFiltered
      ? Math.ceil(totalFiltered / pageSize)
      : 1;
    if (totalFiltered === 0) {
      if (page !== 1) {
        const params = new URLSearchParams(searchParams);
        params.delete('page');
        setSearchParams(params, { replace: true });
      }
      return;
    }
    if (page > computedTotal) {
      const last = Math.max(1, computedTotal);
      const params = new URLSearchParams(searchParams);
      if (last > 1) params.set('page', last.toString());
      else params.delete('page');
      setSearchParams(params, { replace: true });
    }
  }, [isLoading, page, pageSize, searchParams, setSearchParams, totalFiltered]);

  const handleGenerarPDF = async (id: number) => {
    try {
      // TODO: Replace with real API call to GET /api/proforma/{id}/proforma-pdf
      console.log('Generar PDF de proforma:', id);
      // toast.success('PDF de proforma generado');
    } catch (error) {
      // toast.error('No se pudo generar el PDF');
    }
  };

  const handleGenerarFactura = (proformaId: number) => {
    navigate(`/facturas/from-proforma?proformaId=${proformaId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Proformas</h1>
          <p className="text-muted-foreground">Gestión de proformas</p>
        </div>
        <Button onClick={() => navigate('/proformas/nueva')}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Proforma
        </Button>
      </div>

      <ProformaSearchBar
        containerClassName="w-full max-w-md"
        className="w-full"
      />

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
                <TableHead>Total</TableHead>
                <TableHead>Observaciones</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-sm">
                    Cargando proformas...
                  </TableCell>
                </TableRow>
              )}
              {!isLoading &&
                paginated.map((p) => {
                  const total = Number(p.totalEstimado ?? 0);
                  const monedaName = (
                    p.moneda?.descripcion ?? ''
                  ).toUpperCase();
                  const formattedTotal = (() => {
                    if (!Number.isFinite(total)) return '—';
                    if (monedaName === 'DOLARES') {
                      return new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        maximumFractionDigits: 2,
                      }).format(total);
                    }
                    if (monedaName === 'CORDOBAS') {
                      return new Intl.NumberFormat('es-NI', {
                        style: 'currency',
                        currency: 'NIO',
                        maximumFractionDigits: 2,
                      }).format(total);
                    }
                    return new Intl.NumberFormat('es-ES', {
                      style: 'currency',
                      currency: 'USD',
                      maximumFractionDigits: 2,
                    }).format(total);
                  })();
                  return (
                    <TableRow key={p.idProforma} className="table-row-hover">
                      <TableCell className="font-medium">
                        {p.tramiteSeguro?.numeroTramite ?? '—'}
                      </TableCell>
                      <TableCell>
                        {p.consecutivo?.descripcion ?? p.codigoProforma ?? '—'}
                      </TableCell>
                      <TableCell>{p.moneda?.descripcion ?? '—'}</TableCell>
                      <TableCell>{formattedTotal}</TableCell>
                      <TableCell>{p.observaciones ?? '—'}</TableCell>
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
        {totalFiltered > 0 && (
          <Pagination
            currentPage={page}
            totalPages={Math.max(1, Math.ceil(totalFiltered / pageSize))}
            totalItems={totalFiltered}
            pageSize={pageSize}
            onPageChange={(newPage) => {
              const params = new URLSearchParams(searchParams);
              if (newPage > 1) params.set('page', newPage.toString());
              else params.delete('page');
              setSearchParams(params, { replace: true });
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onPageSizeChange={(newSize) => {
              const params = new URLSearchParams(searchParams);
              params.delete('page');
              if (newSize !== 10) params.set('pageSize', newSize.toString());
              else params.delete('pageSize');
              setSearchParams(params, { replace: true });
            }}
          />
        )}
      </Card>
    </div>
  );
}
