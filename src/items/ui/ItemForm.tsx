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
import { SearchableSelect } from '@/shared/components/custom/SearchableSelect';
import type { ItemFormValues, ItemFormErrors } from './item-form.types';
import { EstadoActivo } from '@/shared/types/status';
import { useClasificacionItem } from '@/clasificacion-item/hook/useClasificacionItem';
import { useUnidadMedida } from '@/unidad-medida/hook/useUnidadMedida';
import { useMemo } from 'react';
import { sanitizeString } from '@/shared/utils/security';
import { sanitizeText, VALIDATION_RULES } from '@/shared/utils/validation';

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

  // Convertir clasificaciones a opciones para SearchableSelect
  const clasificacionOptions = useMemo(() => {
    return (clasificacionItems || []).map((c) => ({
      value: c.idClasificacion,
      label: c.descripcion,
    }));
  }, [clasificacionItems]);

  // Convertir unidades de medida a opciones para SearchableSelect
  const unidadMedidaOptions = useMemo(() => {
    return (unidadMedidas || []).map((u) => ({
      value: u.idUnidadMedida,
      label: u.descripcion,
    }));
  }, [unidadMedidas]);

  const handleChange = (
    field: keyof ItemFormValues,
    value: string | boolean
  ) => {
    let sanitizedValue: string | boolean = value;

    // Aplicar sanitización y validación de caracteres repetidos
    if (typeof value === 'string') {
      if (field === 'codigoItem') {
        sanitizedValue = sanitizeText(
          value,
          VALIDATION_RULES.codigo.min,
          VALIDATION_RULES.codigo.max,
          false // No permitir 3 caracteres repetidos
        ).toUpperCase();
      } else if (field === 'descripcion') {
        sanitizedValue = sanitizeText(
          value,
          VALIDATION_RULES.descripcion.min,
          VALIDATION_RULES.descripcion.max,
          false // No permitir 3 caracteres repetidos
        );
      } else if (
        field === 'precioBaseLocal' ||
        field === 'precioBaseDolar' ||
        field === 'precioAdquisicionLocal' ||
        field === 'precioAdquisicionDolar'
      ) {
        // Los precios se validan en validateForm, aquí solo sanitizamos
        sanitizedValue = value;
      } else {
        sanitizedValue = sanitizeString(value, 200);
      }
    }

    const newValues = { ...values, [field]: sanitizedValue };

    // Si el tipo es SERVICIO, bloquear precios y establecerlos en 1
    if (field === 'tipo' && value === 'SERVICIO') {
      newValues.precioBaseLocal = '1';
      newValues.precioBaseDolar = '1';
      newValues.precioAdquisicionLocal = '1';
      newValues.precioAdquisicionDolar = '1';
    }

    onChange(newValues);
  };

  const isServicio = values.tipo === 'SERVICIO';

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="card-elegant">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">
            Información General
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="codigoItem" className="text-sm">
                Código de Item <span className="text-destructive">*</span>
              </Label>
              <Input
                id="codigoItem"
                value={values.codigoItem}
                onChange={(e) => handleChange('codigoItem', e.target.value)}
                placeholder="ITEM-001"
                maxLength={VALIDATION_RULES.codigo.max}
                className="h-10 sm:h-11 text-sm sm:text-base touch-manipulation"
              />
              {errors.codigoItem && (
                <p className="text-xs sm:text-sm text-destructive">
                  {errors.codigoItem}
                </p>
              )}
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="tipo" className="text-sm">
                Tipo <span className="text-destructive">*</span>
              </Label>
              <Select
                value={values.tipo}
                onValueChange={(value) => handleChange('tipo', value)}
              >
                <SelectTrigger
                  id="tipo"
                  className="h-10 sm:h-11 text-sm sm:text-base"
                >
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRODUCTO">Producto</SelectItem>
                  <SelectItem value="SERVICIO">Servicio</SelectItem>
                </SelectContent>
              </Select>
              {errors.tipo && (
                <p className="text-xs sm:text-sm text-destructive">
                  {errors.tipo}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="descripcion" className="text-sm">
              Descripción <span className="text-destructive">*</span>
            </Label>
            <Input
              id="descripcion"
              value={values.descripcion}
              onChange={(e) => handleChange('descripcion', e.target.value)}
              placeholder="Laptop Dell Inspiron 15"
              className="h-10 sm:h-11 text-sm sm:text-base touch-manipulation"
            />
            {errors.descripcion && (
              <p className="text-xs sm:text-sm text-destructive">
                {errors.descripcion}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="clasificacionId" className="text-sm">
                Clasificación <span className="text-destructive">*</span>
              </Label>
              <SearchableSelect
                id="clasificacionId"
                options={clasificacionOptions}
                value={values.clasificacionId || ''}
                onValueChange={(value) =>
                  handleChange('clasificacionId', value)
                }
                placeholder="Selecciona una clasificación"
                searchPlaceholder="Buscar clasificación..."
                emptyMessage="No se encontraron clasificaciones."
                disabled={
                  !clasificacionItems || clasificacionItems.length === 0
                }
              />
              {errors.clasificacionId && (
                <p className="text-xs sm:text-sm text-destructive">
                  {errors.clasificacionId}
                </p>
              )}
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="unidadMedidaId" className="text-sm">
                Unidad de Medida <span className="text-destructive">*</span>
              </Label>
              <SearchableSelect
                id="unidadMedidaId"
                options={unidadMedidaOptions}
                value={values.unidadMedidaId || ''}
                onValueChange={(value) => handleChange('unidadMedidaId', value)}
                placeholder="Selecciona una unidad de medida"
                searchPlaceholder="Buscar unidad de medida..."
                emptyMessage="No se encontraron unidades de medida."
                disabled={!unidadMedidas || unidadMedidas.length === 0}
              />
              {errors.unidadMedidaId && (
                <p className="text-xs sm:text-sm text-destructive">
                  {errors.unidadMedidaId}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="card-elegant">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Precios</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="precioBaseLocal" className="text-sm">
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
                disabled={isServicio}
                className="h-10 sm:h-11 text-sm sm:text-base touch-manipulation"
              />
              {errors.precioBaseLocal && (
                <p className="text-xs sm:text-sm text-destructive">
                  {errors.precioBaseLocal}
                </p>
              )}
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="precioBaseDolar" className="text-sm">
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
                disabled={isServicio}
                className="h-10 sm:h-11 text-sm sm:text-base touch-manipulation"
              />
              {errors.precioBaseDolar && (
                <p className="text-xs sm:text-sm text-destructive">
                  {errors.precioBaseDolar}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="precioAdquisicionLocal" className="text-sm">
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
                disabled={isServicio}
                className="h-10 sm:h-11 text-sm sm:text-base touch-manipulation"
              />
              {errors.precioAdquisicionLocal && (
                <p className="text-xs sm:text-sm text-destructive">
                  {errors.precioAdquisicionLocal}
                </p>
              )}
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="precioAdquisicionDolar" className="text-sm">
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
                disabled={isServicio}
                className="h-10 sm:h-11 text-sm sm:text-base touch-manipulation"
              />
              {errors.precioAdquisicionDolar && (
                <p className="text-xs sm:text-sm text-destructive">
                  {errors.precioAdquisicionDolar}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="card-elegant">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Configuración</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="esCotizable" className="text-sm">
                Es Cotizable
              </Label>
              <p className="text-xs sm:text-sm text-muted-foreground">
                ¿Este item puede ser cotizado?
              </p>
            </div>
            <Switch
              id="esCotizable"
              checked={values.esCotizable}
              onCheckedChange={(checked) =>
                handleChange('esCotizable', checked)
              }
              className="touch-manipulation"
            />
          </div>

          {showEstadoToggle && (
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5 flex-1">
                <Label htmlFor="activo" className="text-sm">
                  Estado del Item
                </Label>
                <p className="text-xs sm:text-sm text-muted-foreground">
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
                className="touch-manipulation"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
