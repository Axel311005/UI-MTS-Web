import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Badge } from '@/shared/components/ui/badge';
import { getCompraById } from '../actions/get-compra-by-id';
import type { Compra } from '../types/Compra.interface';

export default function VerDetallesCompraPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [compra, setCompra] = useState<Compra | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getCompraById(Number(id));
        setCompra(data);
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  if (loading) return <div>Cargando…</div>;
  if (!compra) return <div>No encontrada</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-left">Compra {compra.codigoCompra}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/compras/${compra.idCompra}/editar`)}>Editar</Button>
          <Button variant="outline" onClick={() => navigate('/compras')}>Volver</Button>
        </div>
      </div>
      <Card className="card-elegant">
        <CardHeader>
          <CardTitle>Resumen</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div><span className="text-muted-foreground">Fecha:</span> {new Date(compra.fecha).toLocaleDateString()}</div>
          <div><span className="text-muted-foreground">Bodega:</span> {compra.bodega?.descripcion ?? '—'}</div>
          <div><span className="text-muted-foreground">Moneda:</span> {compra.moneda?.descripcion ?? '—'}</div>
          <div><span className="text-muted-foreground">Tipo pago:</span> {compra.tipoPago?.descripcion ?? '—'}</div>
          <div><span className="text-muted-foreground">Estado:</span> <Badge>{String(compra.estado)}</Badge></div>
          <div><span className="text-muted-foreground">Total:</span> {String(compra.total)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Detalle</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-md border max-h-[480px] relative">
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Cant.</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(compra.lineas ?? []).map((l, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{String(l.cantidad)}</TableCell>
                    <TableCell>{String(l.precioUnitario)}</TableCell>
                    <TableCell>{String(l.totalLinea)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
 
