import { Tag, Edit, Trash2 } from '@/shared/icons';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import type { ClasificacionItem } from '../types/clasificacionItem.interface';
import { formatDate } from '@/shared/utils/formatters';
import { EstadoActivo } from '@/shared/types/status';

interface ClasificacionCardProps {
  clasificacion: ClasificacionItem;
  onView?: (id: number) => void;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  disableDelete?: boolean;
}

export function ClasificacionCard({
  clasificacion,
  onEdit,
  onDelete,
  disableDelete,
}: ClasificacionCardProps) {
  return (
    <Card key={clasificacion.idClasificacion} className="card-elegant">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Tag className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">
              {clasificacion.descripcion}
            </CardTitle>
          </div>
          <Badge
            variant={
              clasificacion.activo === EstadoActivo.ACTIVO
                ? 'default'
                : 'secondary'
            }
          >
            {clasificacion.activo === EstadoActivo.ACTIVO
              ? 'Activo'
              : 'Inactivo'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Fecha creación:</span>
            <span>{formatDate(clasificacion.fechaCreacion)}</span>
          </div>
          <div className="flex space-x-2 pt-4">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onEdit(clasificacion.idClasificacion)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => onDelete(clasificacion.idClasificacion)}
                disabled={disableDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
