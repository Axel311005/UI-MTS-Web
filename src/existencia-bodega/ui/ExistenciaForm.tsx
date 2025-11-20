import React from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { useItem } from '@/items/hooks/useItem';
import { useBodega } from '@/bodega/hook/useBodega';
import { useState } from 'react';
import {
  validateExistencia,
  VALIDATION_RULES,
} from '@/shared/utils/validation';

export interface ExistenciaFormData {
  itemId: number;
  bodegaId: number;
  existenciaMaxima: string;
  existenciaMinima: string;
  puntoDeReorden: string;
}

interface ExistenciaFormProps {
  defaultValues?: ExistenciaFormData;
  onSubmit: (data: ExistenciaFormData) => void;
  isEditing?: boolean;
}

export function ExistenciaForm({
  defaultValues,
  onSubmit,
  isEditing = false,
}: ExistenciaFormProps) {
  const { items } = useItem({ onlyActive: true });
  const { bodegas } = useBodega();

  const [formValues, setFormValues] = useState<ExistenciaFormData>(
    defaultValues || {
      itemId: 0,
      bodegaId: 0,
      existenciaMaxima: '',
      existenciaMinima: '',
      puntoDeReorden: '',
    }
  );
  const [errors, setErrors] = useState<
    Partial<Record<keyof ExistenciaFormData, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ExistenciaFormData, string>> = {};
    if (!formValues.itemId || formValues.itemId < 1) {
      newErrors.itemId = 'Debe seleccionar un item';
    }
    if (!formValues.bodegaId || formValues.bodegaId < 1) {
      newErrors.bodegaId = 'Debe seleccionar una bodega';
    }
    
    // Validar existencia máxima
    if (!formValues.existenciaMaxima.trim()) {
      newErrors.existenciaMaxima = 'La existencia máxima es requerida';
    } else {
      const validation = validateExistencia(
        formValues.existenciaMaxima,
        VALIDATION_RULES.existencia.max
      );
      if (!validation.isValid) {
        newErrors.existenciaMaxima = validation.error || 'Existencia máxima inválida';
      }
    }
    
    // Validar existencia mínima
    if (!formValues.existenciaMinima.trim()) {
      newErrors.existenciaMinima = 'La existencia mínima es requerida';
    } else {
      const validation = validateExistencia(
        formValues.existenciaMinima,
        VALIDATION_RULES.existencia.max
      );
      if (!validation.isValid) {
        newErrors.existenciaMinima = validation.error || 'Existencia mínima inválida';
      }
    }
    
    // Validar punto de reorden
    if (!formValues.puntoDeReorden.trim()) {
      newErrors.puntoDeReorden = 'El punto de reorden es requerido';
    } else {
      const validation = validateExistencia(
        formValues.puntoDeReorden,
        VALIDATION_RULES.existencia.max
      );
      if (!validation.isValid) {
        newErrors.puntoDeReorden = validation.error || 'Punto de reorden inválido';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof ExistenciaFormData, value: any) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await onSubmit(formValues);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="card-elegant">
      <CardHeader>
        <CardTitle>
          {isEditing ? 'Editar Existencia' : 'Nueva Existencia'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="itemId">Item</Label>
              <Select
                value={formValues.itemId?.toString() || ''}
                onValueChange={(value) =>
                  handleChange('itemId', parseInt(value))
                }
                disabled={isEditing}
              >
                <SelectTrigger
                  className={errors.itemId ? 'border-destructive' : ''}
                >
                  <SelectValue placeholder="Seleccionar item" />
                </SelectTrigger>
                <SelectContent>
                  {items?.map((item) => (
                    <SelectItem
                      key={item.idItem}
                      value={item.idItem.toString()}
                    >
                      {item.descripcion}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.itemId && (
                <p className="text-sm text-destructive">{errors.itemId}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bodegaId">Bodega</Label>
              <Select
                value={formValues.bodegaId?.toString() || ''}
                onValueChange={(value) =>
                  handleChange('bodegaId', parseInt(value))
                }
                disabled={isEditing}
              >
                <SelectTrigger
                  className={errors.bodegaId ? 'border-destructive' : ''}
                >
                  <SelectValue placeholder="Seleccionar bodega" />
                </SelectTrigger>
                <SelectContent>
                  {bodegas?.map((bodega) => (
                    <SelectItem
                      key={bodega.idBodega}
                      value={bodega.idBodega.toString()}
                    >
                      {bodega.descripcion}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.bodegaId && (
                <p className="text-sm text-destructive">{errors.bodegaId}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="existenciaMaxima">Existencia Máxima</Label>
              <Input
                id="existenciaMaxima"
                type="number"
                min="0"
                placeholder="0"
                value={formValues.existenciaMaxima}
                onChange={(e) =>
                  handleChange('existenciaMaxima', e.target.value)
                }
                className={errors.existenciaMaxima ? 'border-destructive' : ''}
              />
              {errors.existenciaMaxima && (
                <p className="text-sm text-destructive">
                  {errors.existenciaMaxima}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="existenciaMinima">Existencia Mínima</Label>
              <Input
                id="existenciaMinima"
                type="number"
                min="0"
                placeholder="0"
                value={formValues.existenciaMinima}
                onChange={(e) =>
                  handleChange('existenciaMinima', e.target.value)
                }
                className={errors.existenciaMinima ? 'border-destructive' : ''}
              />
              {errors.existenciaMinima && (
                <p className="text-sm text-destructive">
                  {errors.existenciaMinima}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="puntoDeReorden">Punto de Reorden</Label>
              <Input
                id="puntoDeReorden"
                type="number"
                min="0"
                placeholder="0"
                value={formValues.puntoDeReorden}
                onChange={(e) => handleChange('puntoDeReorden', e.target.value)}
                className={errors.puntoDeReorden ? 'border-destructive' : ''}
              />
              {errors.puntoDeReorden && (
                <p className="text-sm text-destructive">
                  {errors.puntoDeReorden}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="button-hover"
            >
              {isSubmitting
                ? 'Guardando...'
                : isEditing
                ? 'Actualizar'
                : 'Crear'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
