import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { getProformaByIdAction } from '@/proforma/actions/get-proforma-by-id';
import { getProformaLineasByProformaIdAction } from '@/proforma/actions/get-proforma-lineas-by-proforma-id';
import { getTramiteSeguroByIdAction } from '@/tramite-seguro/actions/get-tramite-seguro-by-id';
import type { Factura } from '../types/Factura.interface';

interface FacturaProformaInfoProps {
  factura: Factura;
}

export function FacturaProformaInfo({ factura }: FacturaProformaInfoProps) {
  // Intentar obtener el idProforma de diferentes formas posibles
  const proformaId = 
    factura.proforma?.idProforma || 
    (factura as any)?.idProforma ||
    (factura as any)?.proformaId ||
    null;

  const proformaQuery = useQuery({
    queryKey: ['proforma', proformaId],
    enabled: Number.isFinite(proformaId) && proformaId > 0,
    queryFn: () => getProformaByIdAction(proformaId!),
  });

  const lineasQuery = useQuery({
    queryKey: ['proforma.lineas', proformaId],
    enabled: Number.isFinite(proformaId) && proformaId > 0,
    queryFn: () => getProformaLineasByProformaIdAction(proformaId!),
  });

  // Usar datos de la query si están disponibles (más completos), sino usar los de la factura
  const proforma = proformaQuery.data || factura.proforma;
  const lineas = lineasQuery.data || [];

  // Obtener el ID del trámite si no tenemos el objeto completo
  const tramiteId = useMemo(() => {
    // Primero intentar desde tramiteSeguro.idTramiteSeguro
    if (proforma?.tramiteSeguro?.idTramiteSeguro) {
      return proforma.tramiteSeguro.idTramiteSeguro;
    }
    // Luego desde idTramiteSeguro directo
    if ((proforma as any)?.idTramiteSeguro) {
      return (proforma as any).idTramiteSeguro;
    }
    return null;
  }, [proforma]);

  // Verificar si tenemos el número de trámite completo
  const tieneNumeroTramite = useMemo(() => {
    return !!(proforma?.tramiteSeguro?.numeroTramite);
  }, [proforma?.tramiteSeguro?.numeroTramite]);

  // Query para obtener el trámite completo si solo tenemos el ID
  const tramiteQuery = useQuery({
    queryKey: ['tramiteSeguro', tramiteId],
    enabled: 
      Number.isFinite(tramiteId) && 
      tramiteId > 0 && 
      !tieneNumeroTramite,
    queryFn: () => getTramiteSeguroByIdAction(tramiteId!),
  });

  // Usar el trámite de la query si no está completo en la proforma
  const tramiteCompleto = useMemo(() => {
    if (tieneNumeroTramite && proforma?.tramiteSeguro) {
      return proforma.tramiteSeguro;
    }
    if (tramiteQuery.data) {
      return tramiteQuery.data;
    }
    // Si tenemos el ID pero no el objeto completo, intentar construir uno básico
    if (tramiteId && !tramiteQuery.isLoading) {
      return { idTramiteSeguro: tramiteId, numeroTramite: undefined };
    }
    return null;
  }, [tieneNumeroTramite, proforma?.tramiteSeguro, tramiteQuery.data, tramiteId, tramiteQuery.isLoading]);

  // Formatear fecha
  const fechaFormateada = useMemo(() => {
    if (!proforma?.fecha) return '—';
    const fecha = new Date(proforma.fecha);
    return fecha.toLocaleDateString('es-PY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [proforma?.fecha]);

  // Formatear moneda
  const simboloMoneda = '₲'; // Moneda no tiene campo simbolo, usar por defecto

  // Si no hay proforma, no mostrar nada
  if (!proforma && !proformaQuery.isLoading) {
    return null;
  }

  if (proformaQuery.isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Información de la Proforma</CardTitle>
          <CardDescription>Cargando información...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información de la Proforma</CardTitle>
        <CardDescription>
          Esta factura fue generada desde una proforma
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Información Principal */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Código de Proforma</p>
              <p className="font-semibold text-lg">{proforma?.codigoProforma || '—'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Fecha</p>
              <p className="font-medium">{fechaFormateada}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Trámite</p>
              <div className="flex items-center gap-2 flex-wrap">
                {tramiteCompleto?.numeroTramite ? (
                  <>
                    <p className="font-medium">
                      {tramiteCompleto.numeroTramite}
                    </p>
                    {tramiteCompleto.estado && (
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          tramiteCompleto.estado === 'APROBADO' || 
                          (typeof tramiteCompleto.estado === 'string' && tramiteCompleto.estado.toUpperCase() === 'APROBADO')
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}
                      >
                        {typeof tramiteCompleto.estado === 'string' 
                          ? tramiteCompleto.estado.replace(/_/g, ' ')
                          : String(tramiteCompleto.estado).replace(/_/g, ' ')}
                      </span>
                    )}
                  </>
                ) : tramiteQuery.isLoading ? (
                  <p className="font-medium text-muted-foreground">
                    Cargando trámite...
                  </p>
                ) : tramiteId ? (
                  <p className="font-medium text-muted-foreground">
                    ID: {tramiteId}
                  </p>
                ) : (
                  <p className="font-medium text-muted-foreground">—</p>
                )}
              </div>
            </div>
            {proforma?.impuesto && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Impuesto</p>
                <p className="font-medium">
                  {proforma.impuesto.descripcion} ({proforma.impuesto.porcentaje}%)
                </p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground mb-1">Subtotal</p>
              <p className="font-medium">
                {simboloMoneda} {Number(proforma?.subtotal || 0).toLocaleString('es-PY')}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Impuesto</p>
              <p className="font-medium">
                {simboloMoneda} {Number(proforma?.totalImpuesto || 0).toLocaleString('es-PY')}
              </p>
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <p className="text-sm text-muted-foreground mb-1">Total Estimado</p>
              <p className="font-bold text-xl text-primary">
                {simboloMoneda} {Number(proforma?.totalEstimado || 0).toLocaleString('es-PY')}
              </p>
            </div>
            {proforma?.observaciones && (
              <div className="md:col-span-2 lg:col-span-3">
                <p className="text-sm text-muted-foreground mb-1">Observaciones</p>
                <p className="font-medium text-sm">{proforma.observaciones}</p>
              </div>
            )}
          </div>

          {/* Líneas de la Proforma */}
          {lineas.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Líneas de la Proforma</h3>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead className="text-right">Cantidad</TableHead>
                      <TableHead className="text-right">Precio Unitario</TableHead>
                      <TableHead className="text-right">Total Línea</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lineas.map((linea) => (
                      <TableRow key={linea.idProformaLineas}>
                        <TableCell className="font-medium">
                          {linea.item?.codigoItem || '—'}
                        </TableCell>
                        <TableCell>{linea.item?.descripcion || '—'}</TableCell>
                        <TableCell className="text-right">
                          {Number(linea.cantidad || 0).toLocaleString('es-PY')}
                        </TableCell>
                        <TableCell className="text-right">
                          {simboloMoneda} {Number(linea.precioUnitario || 0).toLocaleString('es-PY')}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {simboloMoneda} {Number(linea.totalLinea || 0).toLocaleString('es-PY')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

