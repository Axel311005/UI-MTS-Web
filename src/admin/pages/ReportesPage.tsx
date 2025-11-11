import { useState } from 'react';
import { Download, TrendingUp, DollarSign, Package, Users, Receipt, FileSpreadsheet, ClipboardList, BarChart3, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { toast } from 'sonner';
import { tallerApi } from '@/shared/api/tallerApi';
import { useAuthStore } from '@/auth/store/auth.store';
import { useMoneda } from '@/moneda/hook/useMoneda';
import { AseguradoraSelect } from '@/shared/components/selects/AseguradoraSelect';

const reportTypes = [
  {
    id: 'clientes',
    title: 'Reporte de Clientes',
    description: 'Clientes por estado',
    icon: Users,
    color: 'text-orange-600',
    endpoint: '/cliente/report/clientes',
  },
  {
    id: 'catalogo',
    title: 'Catálogo de Items',
    description: 'Reporte PDF del catálogo de items',
    icon: Package,
    color: 'text-purple-600',
    endpoint: '/item/report/catalogo',
  },
  {
    id: 'facturas-cliente',
    title: 'Facturas por Cliente',
    description: 'Facturas agrupadas por cliente',
    icon: DollarSign,
    color: 'text-green-600',
    endpoint: '/factura/report/facturas-cliente',
  },
  {
    id: 'inventario',
    title: 'Inventario',
    description: 'Existencias de inventario',
    icon: Package,
    color: 'text-blue-600',
    endpoint: '/existencia-bodega/report/inventario',
  },
  {
    id: 'empleados',
    title: 'Reporte de Empleados',
    description: 'Lista de empleados',
    icon: Users,
    color: 'text-indigo-600',
    endpoint: '/empleado/report/empleados',
  },
  {
    id: 'vehiculos-cliente',
    title: 'Vehículos por Cliente',
    description: 'Vehículos agrupados por cliente',
    icon: ClipboardList,
    color: 'text-teal-600',
    endpoint: '/vehiculo/report/vehiculos-cliente',
  },
  {
    id: 'proformas-cliente',
    title: 'Proformas por Cliente',
    description: 'Proformas agrupadas por cliente',
    icon: Receipt,
    color: 'text-amber-600',
    endpoint: '/proforma/report/proformas-cliente',
  },
  {
    id: 'cotizaciones-cliente',
    title: 'Cotizaciones por Cliente',
    description: 'Cotizaciones agrupadas por cliente',
    icon: FileSpreadsheet,
    color: 'text-cyan-600',
    endpoint: '/cotizacion/report/cotizaciones-cliente',
  },
  {
    id: 'items-cotizados',
    title: 'Items Cotizados',
    description: 'Items más cotizados',
    icon: TrendingUp,
    color: 'text-violet-600',
    endpoint: '/cotizacion/report/items-cotizados',
  },
  {
    id: 'flujo-financiero',
    title: 'Flujo Financiero',
    description: 'Reporte de ingresos y egresos',
    icon: BarChart3,
    color: 'text-emerald-600',
    endpoint: '/financial-reports/flujo',
    special: true, // Requiere parámetros especiales
  },
  {
    id: 'cobro-aseguradora',
    title: 'Cobro a Aseguradora',
    description: 'Reporte de cobro a aseguradora por trámites de seguro',
    icon: Shield,
    color: 'text-rose-600',
    endpoint: '/tramite-seguro/reportes/cobro-aseguradora',
    special: true, // Requiere parámetros especiales
  },
];

export function ReportesPage() {
  const { user } = useAuthStore();
  const { monedas } = useMoneda();
  
  // Estados para el reporte de flujo financiero
  const [flujoFecha, setFlujoFecha] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [flujoFechaInicio, setFlujoFechaInicio] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [flujoFechaFin, setFlujoFechaFin] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [flujoTitulo, setFlujoTitulo] = useState('Flujo financiero mensual');
  const [flujoIdMoneda, setFlujoIdMoneda] = useState<number | ''>(1);
  const [flujoUsarRango, setFlujoUsarRango] = useState(false);

  // Estados para el reporte de cobro a aseguradora
  const [cobroAseguradoraId, setCobroAseguradoraId] = useState<number | ''>('');
  const [cobroFechaInicio, setCobroFechaInicio] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [cobroFechaFin, setCobroFechaFin] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const handleGenerateReport = async (report: typeof reportTypes[0]) => {
    try {
      const dismiss = toast.loading('Generando reporte...');
      
      // Si es el reporte especial de flujo financiero
      if (report.special && report.id === 'flujo-financiero') {
        // Usar nombre completo del empleado si está disponible, sino usar email
        let generadoPor = 'Usuario';
        if (user?.empleado) {
          const nombreCompleto = `${user.empleado.primerNombre || ''} ${user.empleado.primerApellido || ''}`.trim();
          generadoPor = nombreCompleto || user.email || 'Usuario';
        } else if (user?.email) {
          generadoPor = user.email;
        }
        
        const params: Record<string, string | number> = {
          titulo: flujoTitulo,
          generadoPor: generadoPor,
          idMoneda: flujoIdMoneda || 1,
        };

        if (flujoUsarRango) {
          params.fechaInicio = flujoFechaInicio || new Date().toISOString().split('T')[0];
          params.fechaFin = flujoFechaFin || new Date().toISOString().split('T')[0];
        } else {
          params.fecha = flujoFecha || new Date().toISOString().split('T')[0];
        }

        const endpoint = `${report.endpoint}/pdf`;

        const response = await tallerApi.get(endpoint, {
          responseType: 'blob',
          params,
        });

        const mimeType = 'application/pdf';
        const extension = 'pdf';

        const blob = new Blob([response.data], { type: mimeType });
        const urlBlob = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = urlBlob;
        link.download = `${report.id}-${new Date().toISOString().split('T')[0]}.${extension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(urlBlob);

        toast.dismiss(dismiss);
        toast.success('Reporte generado correctamente');
        return;
      }

      // Si es el reporte especial de cobro a aseguradora
      if (report.special && report.id === 'cobro-aseguradora') {
        if (!cobroAseguradoraId || cobroAseguradoraId === 0) {
          toast.error('Debe seleccionar una aseguradora');
          toast.dismiss(dismiss);
          return;
        }

        if (!cobroFechaInicio || !cobroFechaFin) {
          toast.error('Debe seleccionar las fechas de inicio y fin');
          toast.dismiss(dismiss);
          return;
        }

        const params: Record<string, string | number> = {
          aseguradoraId: cobroAseguradoraId,
          fechaInicio: cobroFechaInicio,
          fechaFin: cobroFechaFin,
        };

        const endpoint = `${report.endpoint}/pdf`;

        const response = await tallerApi.get(endpoint, {
          responseType: 'blob',
          params,
        });

        const blob = new Blob([response.data], { type: 'application/pdf' });
        const urlBlob = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = urlBlob;
        link.download = `cobro-aseguradora-${cobroAseguradoraId}-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(urlBlob);

        toast.dismiss(dismiss);
        toast.success('Reporte generado correctamente');
        return;
      }

      // Reportes normales - siempre PDF, sin parámetros de periodo
      const response = await tallerApi.get(report.endpoint, {
        responseType: 'blob',
      });

      // Crear un blob y descargarlo
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const urlBlob = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = urlBlob;
      link.download = `${report.id}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(urlBlob);

      toast.dismiss(dismiss);
      toast.success('Reporte generado correctamente');
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Error al generar el reporte';
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>
          <p className="text-muted-foreground">
            Genera y consulta reportes del sistema
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reportTypes.map((report) => (
          <Card key={report.id} className="card-elegant">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg bg-accent/20`}>
                  <report.icon className={`h-6 w-6 ${report.color}`} />
                </div>
                <div>
                  <CardTitle className="text-lg">{report.title}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-4">
                {report.description}
              </p>
              <div className="space-y-3">
                {report.special && report.id === 'flujo-financiero' ? (
                  <>
                    {/* Selector de tipo de fecha */}
                    <div className="space-y-2">
                      <Label>Tipo de fecha</Label>
                      <Select value={flujoUsarRango ? 'rango' : 'fecha'} onValueChange={(v) => setFlujoUsarRango(v === 'rango')}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fecha">Fecha específica</SelectItem>
                          <SelectItem value="rango">Rango de fechas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Fecha específica o rango */}
                    {flujoUsarRango ? (
                      <div className="space-y-2">
                        <div className="space-y-2">
                          <Label>Fecha inicio</Label>
                          <Input type="date" value={flujoFechaInicio} onChange={(e) => setFlujoFechaInicio(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label>Fecha fin</Label>
                          <Input type="date" value={flujoFechaFin} onChange={(e) => setFlujoFechaFin(e.target.value)} />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label>Fecha</Label>
                        <Input type="date" value={flujoFecha} onChange={(e) => setFlujoFecha(e.target.value)} />
                      </div>
                    )}

                    {/* Título */}
                    <div className="space-y-2">
                      <Label>Título del reporte</Label>
                      <Input 
                        type="text" 
                        value={flujoTitulo} 
                        onChange={(e) => setFlujoTitulo(e.target.value)}
                        placeholder="Flujo financiero mensual"
                      />
                    </div>

                    {/* Moneda */}
                    <div className="space-y-2">
                      <Label>Moneda</Label>
                      <Select 
                        value={flujoIdMoneda?.toString() || '1'} 
                        onValueChange={(v) => setFlujoIdMoneda(Number(v))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(monedas ?? []).map((moneda) => (
                            <SelectItem key={moneda.idMoneda} value={moneda.idMoneda.toString()}>
                              {moneda.descripcion}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                ) : report.special && report.id === 'cobro-aseguradora' ? (
                  <>
                    {/* Selector de aseguradora */}
                    <div className="space-y-2">
                      <Label>Aseguradora <span className="text-destructive">*</span></Label>
                      <AseguradoraSelect
                        selectedId={cobroAseguradoraId === '' ? '' : Number(cobroAseguradoraId)}
                        onSelectId={(id) => setCobroAseguradoraId(id)}
                        onClear={() => setCobroAseguradoraId('')}
                      />
                    </div>

                    {/* Fecha inicio */}
                    <div className="space-y-2">
                      <Label>Fecha inicio <span className="text-destructive">*</span></Label>
                      <Input 
                        type="date" 
                        value={cobroFechaInicio} 
                        onChange={(e) => setCobroFechaInicio(e.target.value)} 
                      />
                    </div>

                    {/* Fecha fin */}
                    <div className="space-y-2">
                      <Label>Fecha fin <span className="text-destructive">*</span></Label>
                      <Input 
                        type="date" 
                        value={cobroFechaFin} 
                        onChange={(e) => setCobroFechaFin(e.target.value)} 
                      />
                    </div>
                  </>
                ) : null}
                <Button
                  className="w-full button-hover"
                  onClick={() => handleGenerateReport(report)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Generar Reporte
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

