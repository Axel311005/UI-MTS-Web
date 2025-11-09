import { useState } from 'react';
import { FileText, Download, Calendar, TrendingUp, DollarSign, Package, Users, ShoppingCart, Receipt, FileSpreadsheet, ClipboardList } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { toast } from 'sonner';
import { tallerApi } from '@/shared/api/tallerApi';

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
    id: 'compras',
    title: 'Reporte de Compras',
    description: 'Compras realizadas',
    icon: ShoppingCart,
    color: 'text-blue-600',
    endpoint: '/compra/report/compras',
    individual: true, // Puede generar PDF individual
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
    title: 'Items Más Cotizados',
    description: 'Reporte de items más cotizados',
    icon: TrendingUp,
    color: 'text-violet-600',
    endpoint: '/cotizacion/report/items-cotizados',
  },
];

export function ReportesPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('mes');
  const [selectedFormat, setSelectedFormat] = useState('pdf');

  const handleGenerateReport = async (report: typeof reportTypes[0]) => {
    try {
      const dismiss = toast.loading('Generando reporte...');
      const response = await tallerApi.get(report.endpoint, {
        responseType: 'blob',
        params: selectedPeriod !== 'mes' ? { periodo: selectedPeriod } : undefined,
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
                <div className="grid grid-cols-2 gap-2">
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="semana">Esta semana</SelectItem>
                      <SelectItem value="mes">Este mes</SelectItem>
                      <SelectItem value="trimestre">Trimestre</SelectItem>
                      <SelectItem value="ano">Este año</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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

