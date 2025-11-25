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
import { useMoneda } from '@/moneda/hook/useMoneda';
import { useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { sanitizeString } from '@/shared/utils/security';
import { sanitizeText, VALIDATION_RULES } from '@/shared/utils/validation';
import DOMPurify from 'dompurify';
import {
  getCategoriasByTipo,
  generateCodigoItem,
} from '../config/codigo-item-categorias';

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
  const { monedas } = useMoneda();

  // Usar react-hook-form para manejar el estado del formulario
  const form = useForm<ItemFormValues>({
    defaultValues: values,
    mode: 'onChange',
  });

  // Sincronizar valores del padre con el formulario cuando cambien
  const prevValuesRef = useRef(values);
  if (prevValuesRef.current !== values) {
    form.reset(values);
    prevValuesRef.current = values;
  }

  // Observar cambios en los valores del formulario
  const watchedValues = form.watch();

  // Ref para rastrear el último campo modificado (sin causar re-renders)
  const lastModifiedField = useRef<keyof ItemFormValues | null>(null);

  // Obtener el tipo de cambio de dólares
  const tipoCambioDolar = useMemo(() => {
    const monedaDolar = (monedas || []).find((m) => {
      const desc = (m.descripcion || '').toUpperCase().trim();
      return desc === 'DOLARES';
    });
    return monedaDolar ? Number(monedaDolar.tipoCambio) : 0;
  }, [monedas]);

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

  // Obtener categorías filtradas por tipo seleccionado
  const categoriasDisponibles = useMemo(() => {
    return getCategoriasByTipo(watchedValues.tipo || 'PRODUCTO');
  }, [watchedValues.tipo]);

  // Opciones para el SearchableSelect de categorías (formato: "CÓDIGO (Descripción)")
  const categoriaOptions = useMemo(() => {
    return categoriasDisponibles.map((cat) => ({
      value: `${cat.codigo}-`, // Value incluye el guion
      label: `${cat.codigo} (${cat.nombre})`, // Label muestra "CÓDIGO (Descripción)"
    }));
  }, [categoriasDisponibles]);

  // Generar codigoItem automáticamente cuando cambien codigoCategoria o codigoConsecutivo
  useMemo(() => {
    if (watchedValues.codigoCategoria && watchedValues.codigoConsecutivo) {
      const codigoGenerado = generateCodigoItem(
        watchedValues.codigoCategoria,
        watchedValues.codigoConsecutivo
      );
      if (codigoGenerado !== watchedValues.codigoItem) {
        form.setValue('codigoItem', codigoGenerado, { shouldValidate: false });
        onChange({
          ...watchedValues,
          codigoItem: codigoGenerado,
        });
      }
    } else if (
      !watchedValues.codigoCategoria ||
      !watchedValues.codigoConsecutivo
    ) {
      // Limpiar codigoItem si falta alguno de los componentes
      if (watchedValues.codigoItem) {
        form.setValue('codigoItem', '', { shouldValidate: false });
        onChange({
          ...watchedValues,
          codigoItem: '',
        });
      }
    }
  }, [
    watchedValues.codigoCategoria,
    watchedValues.codigoConsecutivo,
    watchedValues.codigoItem,
  ]);

  // Limpiar campos de código cuando cambie el tipo (usando useEffect para evitar loops)
  const prevTipoRef = useRef(watchedValues.tipo);
  if (prevTipoRef.current !== watchedValues.tipo) {
    prevTipoRef.current = watchedValues.tipo;
    // Limpiar solo si realmente cambió
    if (watchedValues.codigoCategoria || watchedValues.codigoConsecutivo) {
      form.setValue('codigoCategoria', '', { shouldValidate: false });
      form.setValue('codigoConsecutivo', '', { shouldValidate: false });
      form.setValue('codigoItem', '', { shouldValidate: false });
    }
  }

  // Función para convertir de Córdobas a Dólares
  const convertirLocalADolar = (valorLocal: string): string => {
    if (!valorLocal || valorLocal.trim() === '' || tipoCambioDolar === 0)
      return '';
    const num = Number(valorLocal);
    if (isNaN(num) || num <= 0) return '';
    const resultado = num / tipoCambioDolar;
    return resultado.toFixed(2);
  };

  // Función para convertir de Dólares a Córdobas
  const convertirDolarALocal = (valorDolar: string): string => {
    if (!valorDolar || valorDolar.trim() === '' || tipoCambioDolar === 0)
      return '';
    const num = Number(valorDolar);
    if (isNaN(num) || num <= 0) return '';
    const resultado = num * tipoCambioDolar;
    return resultado.toFixed(2);
  };

  // Calcular qué input está activo basándome en los valores observados y el último campo modificado
  // Cada par (base y adquisición) funciona de forma independiente
  const activeInput = useMemo(() => {
    const lastField = lastModifiedField.current;

    const base: 'local' | 'dolar' | null = (() => {
      // Solo considerar campos de "base" para este cálculo
      const precioBaseLocal = watchedValues.precioBaseLocal || '';
      const precioBaseDolar = watchedValues.precioBaseDolar || '';

      // Si el último campo modificado fue precioBaseLocal y tiene valor válido
      if (lastField === 'precioBaseLocal') {
        const valorLocal = precioBaseLocal.trim();
        if (
          valorLocal &&
          !isNaN(Number(valorLocal)) &&
          Number(valorLocal) > 0
        ) {
          return 'local';
        }
      }

      // Si el último campo modificado fue precioBaseDolar y tiene valor válido
      if (lastField === 'precioBaseDolar') {
        const valorDolar = precioBaseDolar.trim();
        if (
          valorDolar &&
          !isNaN(Number(valorDolar)) &&
          Number(valorDolar) > 0
        ) {
          return 'dolar';
        }
      }

      // Si el último campo modificado NO es de "base", no determinar activo por valores
      // Solo determinar por valores si no hay un campo modificado recientemente o si fue un campo de base
      if (
        lastField &&
        lastField !== 'precioBaseLocal' &&
        lastField !== 'precioBaseDolar'
      ) {
        // Si se modificó un campo de adquisición, mantener el estado actual de base sin cambios
        // o determinar por valores solo si ambos tienen valor
        const localVal = precioBaseLocal.trim();
        const dolarVal = precioBaseDolar.trim();

        if (!localVal && !dolarVal) return null;

        // Si solo uno tiene valor, ese está activo
        if (localVal && !dolarVal) return 'local';
        if (dolarVal && !localVal) return 'dolar';

        // Si ambos tienen valor, verificar cuál coincide con el cálculo
        const localNum = Number(localVal);
        const dolarNum = Number(dolarVal);
        if (localNum > 0 && dolarNum > 0 && tipoCambioDolar > 0) {
          const dolarCalculado = convertirLocalADolar(localVal);
          const localCalculado = convertirDolarALocal(dolarVal);

          if (
            dolarCalculado &&
            Math.abs(Number(dolarCalculado) - dolarNum) < 0.01
          ) {
            return 'local';
          }
          if (
            localCalculado &&
            Math.abs(Number(localCalculado) - localNum) < 0.01
          ) {
            return 'dolar';
          }
        }
        return null;
      }

      // Si no hay último campo modificado o fue un campo de base, determinar por los valores actuales
      const localVal = precioBaseLocal.trim();
      const dolarVal = precioBaseDolar.trim();
      const localNum = localVal ? Number(localVal) : 0;
      const dolarNum = dolarVal ? Number(dolarVal) : 0;

      // Si ambos están vacíos, ninguno está activo
      if (!localVal && !dolarVal) return null;

      // Si solo uno tiene valor, ese está activo
      if (localVal && !dolarVal) return 'local';
      if (dolarVal && !localVal) return 'dolar';

      // Si ambos tienen valor, verificar cuál coincide con el cálculo
      if (localNum > 0 && dolarNum > 0 && tipoCambioDolar > 0) {
        const dolarCalculado = convertirLocalADolar(localVal);
        const localCalculado = convertirDolarALocal(dolarVal);

        // Si el dólar coincide con el cálculo desde local, local está activo
        if (
          dolarCalculado &&
          Math.abs(Number(dolarCalculado) - dolarNum) < 0.01
        ) {
          return 'local';
        }
        // Si el local coincide con el cálculo desde dólar, dólar está activo
        if (
          localCalculado &&
          Math.abs(Number(localCalculado) - localNum) < 0.01
        ) {
          return 'dolar';
        }
      }

      return null;
    })();

    const adquisicion: 'local' | 'dolar' | null = (() => {
      // Solo considerar campos de "adquisición" para este cálculo
      const precioAdqLocal = watchedValues.precioAdquisicionLocal || '';
      const precioAdqDolar = watchedValues.precioAdquisicionDolar || '';

      // Si el último campo modificado fue precioAdquisicionLocal y tiene valor válido
      if (lastField === 'precioAdquisicionLocal') {
        const valorLocal = precioAdqLocal.trim();
        if (
          valorLocal &&
          !isNaN(Number(valorLocal)) &&
          Number(valorLocal) > 0
        ) {
          return 'local';
        }
      }

      // Si el último campo modificado fue precioAdquisicionDolar y tiene valor válido
      if (lastField === 'precioAdquisicionDolar') {
        const valorDolar = precioAdqDolar.trim();
        if (
          valorDolar &&
          !isNaN(Number(valorDolar)) &&
          Number(valorDolar) > 0
        ) {
          return 'dolar';
        }
      }

      // Si el último campo modificado NO es de "adquisición", no determinar activo por valores
      // Solo determinar por valores si no hay un campo modificado recientemente o si fue un campo de adquisición
      if (
        lastField &&
        lastField !== 'precioAdquisicionLocal' &&
        lastField !== 'precioAdquisicionDolar'
      ) {
        // Si se modificó un campo de base, mantener el estado actual de adquisición sin cambios
        // o determinar por valores solo si ambos tienen valor
        const localVal = precioAdqLocal.trim();
        const dolarVal = precioAdqDolar.trim();

        if (!localVal && !dolarVal) return null;

        // Si solo uno tiene valor, ese está activo
        if (localVal && !dolarVal) return 'local';
        if (dolarVal && !localVal) return 'dolar';

        // Si ambos tienen valor, verificar cuál coincide con el cálculo
        const localNum = Number(localVal);
        const dolarNum = Number(dolarVal);
        if (localNum > 0 && dolarNum > 0 && tipoCambioDolar > 0) {
          const dolarCalculado = convertirLocalADolar(localVal);
          const localCalculado = convertirDolarALocal(dolarVal);

          if (
            dolarCalculado &&
            Math.abs(Number(dolarCalculado) - dolarNum) < 0.01
          ) {
            return 'local';
          }
          if (
            localCalculado &&
            Math.abs(Number(localCalculado) - localNum) < 0.01
          ) {
            return 'dolar';
          }
        }
        return null;
      }

      // Si no hay último campo modificado o fue un campo de adquisición, determinar por los valores actuales
      const localVal = precioAdqLocal.trim();
      const dolarVal = precioAdqDolar.trim();
      const localNum = localVal ? Number(localVal) : 0;
      const dolarNum = dolarVal ? Number(dolarVal) : 0;

      // Si ambos están vacíos, ninguno está activo
      if (!localVal && !dolarVal) return null;

      // Si solo uno tiene valor, ese está activo
      if (localVal && !dolarVal) return 'local';
      if (dolarVal && !localVal) return 'dolar';

      // Si ambos tienen valor, verificar cuál coincide con el cálculo
      if (localNum > 0 && dolarNum > 0 && tipoCambioDolar > 0) {
        const dolarCalculado = convertirLocalADolar(localVal);
        const localCalculado = convertirDolarALocal(dolarVal);

        // Si el dólar coincide con el cálculo desde local, local está activo
        if (
          dolarCalculado &&
          Math.abs(Number(dolarCalculado) - dolarNum) < 0.01
        ) {
          return 'local';
        }
        // Si el local coincide con el cálculo desde dólar, dólar está activo
        if (
          localCalculado &&
          Math.abs(Number(localCalculado) - localNum) < 0.01
        ) {
          return 'dolar';
        }
      }

      return null;
    })();

    return { base, adquisicion };
  }, [
    watchedValues.precioBaseLocal,
    watchedValues.precioBaseDolar,
    watchedValues.precioAdquisicionLocal,
    watchedValues.precioAdquisicionDolar,
    tipoCambioDolar,
  ]);

  const handleChange = (
    field: keyof ItemFormValues,
    value: string | boolean
  ) => {
    let sanitizedValue: string | boolean = value;

    // Aplicar sanitización y validación de caracteres repetidos
    if (typeof value === 'string') {
      if (field === 'codigoConsecutivo') {
        // Solo permitir números, máximo 5 dígitos
        const numeros = value.replace(/\D/g, '');
        let numerosLimpios = numeros;

        if (numeros.length > 5) {
          numerosLimpios = numeros.slice(0, 5);
        }

        // Remover ceros a la izquierda para obtener el número real
        const sinCerosIzq = numerosLimpios.replace(/^0+/, '');

        // Validar: no permitir que sea solo ceros (00000, 0, etc.)
        // Si después de remover ceros a la izquierda queda vacío, significa que era solo ceros
        if (!sinCerosIzq) {
          // Si el campo está vacío o solo tiene ceros, limpiar
          sanitizedValue = '';
        } else {
          // Permitir el valor sin ceros a la izquierda
          sanitizedValue = sinCerosIzq;
        }

        // Formatear automáticamente el codigoItem si hay categoría y consecutivo válido
        const currentValues = form.getValues();
        if (currentValues.codigoCategoria && sanitizedValue) {
          const codigoGenerado = generateCodigoItem(
            currentValues.codigoCategoria,
            sanitizedValue
          );
          form.setValue('codigoItem', codigoGenerado, {
            shouldValidate: false,
          });
        } else {
          // Limpiar codigoItem si el consecutivo no es válido
          form.setValue('codigoItem', '', { shouldValidate: false });
        }
      } else if (field === 'codigoCategoria') {
        // El valor ya viene con el guion del select
        sanitizedValue = value.toUpperCase();
        // Formatear automáticamente el codigoItem si hay consecutivo
        const currentValues = form.getValues();
        if (currentValues.codigoConsecutivo && sanitizedValue) {
          const codigoGenerado = generateCodigoItem(
            sanitizedValue,
            currentValues.codigoConsecutivo
          );
          form.setValue('codigoItem', codigoGenerado, {
            shouldValidate: false,
          });
        }
      } else if (field === 'codigoItem') {
        // Permitir edición manual del código completo (para compatibilidad)
        // Permitir caracteres repetidos (ceros en formato XXX-00000)
        sanitizedValue = sanitizeText(
          value,
          VALIDATION_RULES.codigo.min,
          VALIDATION_RULES.codigo.max,
          true // allowRepeats: true para permitir ceros consecutivos en formato SKU
        ).toUpperCase();
      } else if (field === 'descripcion') {
        // Para descripción, preservar espacios mientras el usuario escribe
        // Solo aplicar sanitización básica sin trim en tiempo real
        let desc = value;

        // Limitar longitud
        if (desc.length > VALIDATION_RULES.descripcion.max) {
          desc = desc.slice(0, VALIDATION_RULES.descripcion.max);
        }

        // Aplicar sanitización XSS pero preservar espacios
        desc = DOMPurify.sanitize(desc, {
          ALLOWED_TAGS: [],
          ALLOWED_ATTR: [],
          KEEP_CONTENT: true,
        });

        sanitizedValue = desc;
      } else if (
        field === 'precioBaseLocal' ||
        field === 'precioBaseDolar' ||
        field === 'precioAdquisicionLocal' ||
        field === 'precioAdquisicionDolar'
      ) {
        // ✅ PROTECCIÓN UNIVERSAL SQL/XSS: Aunque sean precios, sanitizar primero
        // Luego se validan como números en validateForm
        sanitizedValue = sanitizeString(value, 50); // Protección SQL/XSS
      } else {
        sanitizedValue = sanitizeString(value, 200);
      }
    }

    // Rastrear el último campo modificado
    lastModifiedField.current = field;

    // Actualizar el valor en el formulario
    form.setValue(field, sanitizedValue as any, { shouldValidate: false });

    // Obtener los valores actuales del formulario
    const currentValues = form.getValues();
    const newValues = { ...currentValues, [field]: sanitizedValue };

    // Si el tipo es SERVICIO, bloquear precios y establecerlos en 1
    if (field === 'tipo' && value === 'SERVICIO') {
      newValues.precioBaseLocal = '1';
      newValues.precioBaseDolar = '1';
      newValues.precioAdquisicionLocal = '1';
      newValues.precioAdquisicionDolar = '1';
      lastModifiedField.current = null;
      form.setValue('precioBaseLocal', '1', { shouldValidate: false });
      form.setValue('precioBaseDolar', '1', { shouldValidate: false });
      form.setValue('precioAdquisicionLocal', '1', { shouldValidate: false });
      form.setValue('precioAdquisicionDolar', '1', { shouldValidate: false });
    }

    // Lógica de conversión automática para precios
    if (field === 'precioBaseLocal' && typeof value === 'string') {
      const valorTrimmed = value.trim();
      // Si el valor está vacío o no es un número válido, limpiar el otro campo
      if (
        !valorTrimmed ||
        isNaN(Number(valorTrimmed)) ||
        Number(valorTrimmed) <= 0
      ) {
        if (!valorTrimmed) {
          newValues.precioBaseDolar = '';
          form.setValue('precioBaseDolar', '', { shouldValidate: false });
        }
      } else {
        // Usuario escribió en Local → calcular Dólar
        const valorDolar = convertirLocalADolar(valorTrimmed);
        newValues.precioBaseDolar = valorDolar;
        form.setValue('precioBaseDolar', valorDolar, { shouldValidate: false });
      }
    } else if (field === 'precioBaseDolar' && typeof value === 'string') {
      const valorTrimmed = value.trim();
      // Si el valor está vacío o no es un número válido, limpiar el otro campo
      if (
        !valorTrimmed ||
        isNaN(Number(valorTrimmed)) ||
        Number(valorTrimmed) <= 0
      ) {
        if (!valorTrimmed) {
          newValues.precioBaseLocal = '';
          form.setValue('precioBaseLocal', '', { shouldValidate: false });
        }
      } else {
        // Usuario escribió en Dólar → calcular Local
        const valorLocal = convertirDolarALocal(valorTrimmed);
        newValues.precioBaseLocal = valorLocal;
        form.setValue('precioBaseLocal', valorLocal, { shouldValidate: false });
      }
    } else if (
      field === 'precioAdquisicionLocal' &&
      typeof value === 'string'
    ) {
      const valorTrimmed = value.trim();
      // Si el valor está vacío o no es un número válido, limpiar el otro campo
      if (
        !valorTrimmed ||
        isNaN(Number(valorTrimmed)) ||
        Number(valorTrimmed) <= 0
      ) {
        if (!valorTrimmed) {
          newValues.precioAdquisicionDolar = '';
          form.setValue('precioAdquisicionDolar', '', {
            shouldValidate: false,
          });
        }
      } else {
        // Usuario escribió en Local → calcular Dólar
        const valorDolar = convertirLocalADolar(valorTrimmed);
        newValues.precioAdquisicionDolar = valorDolar;
        form.setValue('precioAdquisicionDolar', valorDolar, {
          shouldValidate: false,
        });
      }
    } else if (
      field === 'precioAdquisicionDolar' &&
      typeof value === 'string'
    ) {
      const valorTrimmed = value.trim();
      // Si el valor está vacío o no es un número válido, limpiar el otro campo
      if (
        !valorTrimmed ||
        isNaN(Number(valorTrimmed)) ||
        Number(valorTrimmed) <= 0
      ) {
        if (!valorTrimmed) {
          newValues.precioAdquisicionLocal = '';
          form.setValue('precioAdquisicionLocal', '', {
            shouldValidate: false,
          });
        }
      } else {
        // Usuario escribió en Dólar → calcular Local
        const valorLocal = convertirDolarALocal(valorTrimmed);
        newValues.precioAdquisicionLocal = valorLocal;
        form.setValue('precioAdquisicionLocal', valorLocal, {
          shouldValidate: false,
        });
      }
    }

    // Notificar al padre del cambio
    onChange(newValues);
  };

  const isServicio = watchedValues.tipo === 'SERVICIO';

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
              <Label htmlFor="tipo" className="text-sm">
                Tipo <span className="text-destructive">*</span>
              </Label>
              <Select
                value={watchedValues.tipo || 'PRODUCTO'}
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

          <div className="space-y-1.5 sm:space-y-2 md:col-span-2">
            <Label className="text-sm">
              Código de Item (SKU) <span className="text-destructive">*</span>
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <SearchableSelect
                options={categoriaOptions}
                value={watchedValues.codigoCategoria || ''}
                onValueChange={(value) =>
                  handleChange('codigoCategoria', value)
                }
                placeholder="Buscar codigo..."
                emptyMessage="No se encontraron categorías"
                className="h-10 sm:h-11 text-sm sm:text-base"
              />
              <Input
                id="codigoConsecutivo"
                type="text"
                inputMode="numeric"
                value={watchedValues.codigoConsecutivo || ''}
                onChange={(e) =>
                  handleChange('codigoConsecutivo', e.target.value)
                }
                placeholder="00001"
                maxLength={5}
                className="h-10 sm:h-11 text-sm sm:text-base touch-manipulation"
              />
            </div>
            {/* Mostrar el código generado */}
            {watchedValues.codigoItem && (
              <div className="mt-2 p-2 bg-muted rounded-md">
                <p className="text-xs text-muted-foreground mb-1">
                  Código generado:
                </p>
                <p className="text-sm font-mono font-semibold">
                  {watchedValues.codigoItem}
                </p>
              </div>
            )}
            {errors.codigoItem && (
              <p className="text-xs sm:text-sm text-destructive">
                {errors.codigoItem}
              </p>
            )}
            {errors.codigoCategoria && (
              <p className="text-xs sm:text-sm text-destructive">
                {errors.codigoCategoria}
              </p>
            )}
            {errors.codigoConsecutivo && (
              <p className="text-xs sm:text-sm text-destructive">
                {errors.codigoConsecutivo}
              </p>
            )}
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="descripcion" className="text-sm">
              Descripción <span className="text-destructive">*</span>
            </Label>
            <Input
              id="descripcion"
              value={watchedValues.descripcion || ''}
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
                value={watchedValues.clasificacionId || ''}
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
                value={watchedValues.unidadMedidaId || ''}
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
                Precio Base Local (C$){' '}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="precioBaseLocal"
                type="number"
                min="0"
                step="0.01"
                value={watchedValues.precioBaseLocal || ''}
                onChange={(e) =>
                  handleChange('precioBaseLocal', e.target.value)
                }
                placeholder="5000000"
                disabled={isServicio || activeInput.base === 'dolar'}
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
                value={watchedValues.precioBaseDolar || ''}
                onChange={(e) =>
                  handleChange('precioBaseDolar', e.target.value)
                }
                placeholder="714.29"
                disabled={isServicio || activeInput.base === 'local'}
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
                Precio Adquisición Local (C$)
              </Label>
              <Input
                id="precioAdquisicionLocal"
                type="number"
                min="0"
                step="0.01"
                value={watchedValues.precioAdquisicionLocal || ''}
                onChange={(e) =>
                  handleChange('precioAdquisicionLocal', e.target.value)
                }
                placeholder="4000000"
                disabled={isServicio || activeInput.adquisicion === 'dolar'}
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
                value={watchedValues.precioAdquisicionDolar || ''}
                onChange={(e) =>
                  handleChange('precioAdquisicionDolar', e.target.value)
                }
                placeholder="571.43"
                disabled={isServicio || activeInput.adquisicion === 'local'}
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
              checked={watchedValues.esCotizable || false}
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
                checked={watchedValues.activo === EstadoActivo.ACTIVO}
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
