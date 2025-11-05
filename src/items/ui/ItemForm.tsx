import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import type { ItemFormValues, ItemFormErrors } from './item-form.types';
import { EstadoActivo } from '@/shared/types/status';
import { useClasificacionItem } from '@/clasificacion-item/hook/useClasificacionItem';
import { useUnidadMedida } from '@/unidad-medida/hook/useUnidadMedida';

interface ItemFormProps {
  values: ItemFormValues;
  onChange: (values: ItemFormValues) => void;
  errors: ItemFormErrors;
  showEstadoToggle?: boolean;
}

export function ItemForm({
  values,
  onChange,
  errors,
  showEstadoToggle = false,
}: ItemFormProps) {
  const { clasificacionItems } = useClasificacionItem();
  const { unidadMedidas } = useUnidadMedida();

  const handleChange = (
    field: keyof ItemFormValues,
    value: string | boolean
  ) => {
    onChange({ ...values, [field]: value });
  };

  return (
    <div className="space-y-6">
      <Card className="card-elegant">
        <CardHeader>
          <CardTitle>Información General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="codigoItem">
                Código de Item <span className="text-destructive">*</span>
              </Label>
              <Input
                id="codigoItem"
                value={values.codigoItem}
                onChange={(e) => handleChange('codigoItem', e.target.value)}
                placeholder="ITEM-001"
              />
              {errors.codigoItem && (
                <p className="text-sm text-destructive">{errors.codigoItem}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">
                Tipo <span className="text-destructive">*</span>
              </Label>
              <Select
                value={values.tipo}
                onValueChange={(value) => handleChange('tipo', value)}
              >
                <SelectTrigger id="tipo">
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRODUCTO">Producto</SelectItem>
                  <SelectItem value="SERVICIO">Servicio</SelectItem>
                </SelectContent>
              </Select>
              {errors.tipo && (
                <p className="text-sm text-destructive">{errors.tipo}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">
              Descripción <span className="text-destructive">*</span>
            </Label>
            <Input
              id="descripcion"
              value={values.descripcion}
              onChange={(e) => handleChange('descripcion', e.target.value)}
              placeholder="Laptop Dell Inspiron 15"
            />
            {errors.descripcion && (
              <p className="text-sm text-destructive">{errors.descripcion}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clasificacionId">
                Clasificación <span className="text-destructive">*</span>
              </Label>
              <Select
                value={
                  values.clasificacionId ? String(values.clasificacionId) : ''
                }
                onValueChange={(value) =>
                  handleChange('clasificacionId', value)
                }
                disabled={!clasificacionItems}
              >
                <SelectTrigger id="clasificacionId">
                  <SelectValue placeholder="Selecciona una clasificación" />
                </SelectTrigger>
                <SelectContent>
                  {clasificacionItems?.map((c) => (
                    <SelectItem
                      key={c.idClasificacion}
                      value={String(c.idClasificacion)}
                    >
                      {c.descripcion}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.clasificacionId && (
                <p className="text-sm text-destructive">
                  {errors.clasificacionId}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="unidadMedidaId">
                Unidad de Medida <span className="text-destructive">*</span>
              </Label>
              <Select
                value={
                  values.unidadMedidaId ? String(values.unidadMedidaId) : ''
                }
                onValueChange={(value) => handleChange('unidadMedidaId', value)}
                disabled={!unidadMedidas}
              >
                <SelectTrigger id="unidadMedidaId">
                  <SelectValue placeholder="Selecciona una unidad de medida" />
                </SelectTrigger>
                <SelectContent>
                  {unidadMedidas?.map((u) => (
                    <SelectItem
                      key={u.idUnidadMedida}
                      value={String(u.idUnidadMedida)}
                    >
                      {u.descripcion}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.unidadMedidaId && (
                <p className="text-sm text-destructive">
                  {errors.unidadMedidaId}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="card-elegant">
        <CardHeader>
          <CardTitle>Precios</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="precioBaseLocal">
                Precio Base Local (Gs.){' '}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="precioBaseLocal"
                type="number"
                min="0"
                step="0.01"
                value={values.precioBaseLocal}
                onChange={(e) =>
                  handleChange('precioBaseLocal', e.target.value)
                }
                placeholder="5000000"
              />
              {errors.precioBaseLocal && (
                <p className="text-sm text-destructive">
                  {errors.precioBaseLocal}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="precioBaseDolar">
                Precio Base Dólar (USD){' '}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="precioBaseDolar"
                type="number"
                min="0"
                step="0.01"
                value={values.precioBaseDolar}
                onChange={(e) =>
                  handleChange('precioBaseDolar', e.target.value)
                }
                placeholder="714.29"
              />
              {errors.precioBaseDolar && (
                <p className="text-sm text-destructive">
                  {errors.precioBaseDolar}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="precioAdquisicionLocal">
                Precio Adquisición Local (Gs.)
              </Label>
              <Input
                id="precioAdquisicionLocal"
                type="number"
                min="0"
                step="0.01"
                value={values.precioAdquisicionLocal}
                onChange={(e) =>
                  handleChange('precioAdquisicionLocal', e.target.value)
                }
                placeholder="4000000"
              />
              {errors.precioAdquisicionLocal && (
                <p className="text-sm text-destructive">
                  {errors.precioAdquisicionLocal}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="precioAdquisicionDolar">
                Precio Adquisición Dólar (USD)
              </Label>
              <Input
                id="precioAdquisicionDolar"
                type="number"
                min="0"
                step="0.01"
                value={values.precioAdquisicionDolar}
                onChange={(e) =>
                  handleChange('precioAdquisicionDolar', e.target.value)
                }
                placeholder="571.43"
              />
              {errors.precioAdquisicionDolar && (
                <p className="text-sm text-destructive">
                  {errors.precioAdquisicionDolar}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="card-elegant">
        <CardHeader>
          <CardTitle>Configuración</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="esCotizable">Es Cotizable</Label>
              <p className="text-sm text-muted-foreground">
                ¿Este item puede ser cotizado?
              </p>
            </div>
            <Switch
              id="esCotizable"
              checked={values.esCotizable}
              onCheckedChange={(checked) =>
                handleChange('esCotizable', checked)
              }
            />
          </div>

          {showEstadoToggle && (
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="activo">Estado del Item</Label>
                <p className="text-sm text-muted-foreground">
                  ¿Este item está activo?
                </p>
              </div>
              <Switch
                id="activo"
                checked={values.activo === EstadoActivo.ACTIVO}
                onCheckedChange={(checked) =>
                  handleChange(
                    'activo',
                    checked ? EstadoActivo.ACTIVO : EstadoActivo.INACTIVO
                  )
                }
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
