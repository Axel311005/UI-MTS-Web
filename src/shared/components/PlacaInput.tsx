import { useState, useEffect } from 'react';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';

/**
 * Departamentos disponibles para placas
 */
export const DEPARTAMENTOS_PLACA = [
  { value: 'BO', label: 'BO - Boaco' },
  { value: 'CZ', label: 'CZ - Carazo' },
  { value: 'CH', label: 'CH - Chinandega' },
  { value: 'CT', label: 'CT - Chontales' },
  { value: 'ES', label: 'ES - Estelí' },
  { value: 'GR', label: 'GR - Granada' },
  { value: 'JI', label: 'JI - Jinotega' },
  { value: 'LE', label: 'LE - León' },
  { value: 'MZ', label: 'MZ - Madriz' },
  { value: 'M', label: 'M - Managua' },
  { value: 'MY', label: 'MY - Masaya' },
  { value: 'MT', label: 'MT - Matagalpa' },
  { value: 'NS', label: 'NS - Nueva Segovia' },
  { value: 'RJ', label: 'RJ - Río San Juan' },
  { value: 'RI', label: 'RI - Rivas' },
  { value: 'RN', label: 'RN - RAAN' },
  { value: 'RS', label: 'RS - RAAS' },
] as const;

export type DepartamentoPlaca = typeof DEPARTAMENTOS_PLACA[number]['value'];

interface PlacaInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  error?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * Componente para input de placa con selector de departamento y números
 * Formato: M566874 (departamento + 3-6 dígitos)
 */
export function PlacaInput({
  value,
  onChange,
  label = 'Placa',
  required = false,
  error,
  className = '',
  disabled = false,
}: PlacaInputProps) {
  // Separar departamento y números de la placa actual
  const [departamento, setDepartamento] = useState<DepartamentoPlaca | ''>('');
  const [numeros, setNumeros] = useState('');

  // Parsear el valor inicial
  useEffect(() => {
    if (value) {
      // Buscar si empieza con algún departamento
      const dept = DEPARTAMENTOS_PLACA.find((d) => value.startsWith(d.value));
      if (dept) {
        setDepartamento(dept.value);
        setNumeros(value.slice(dept.value.length));
      } else {
        // Si no tiene departamento, intentar extraer números
        const nums = value.replace(/\D/g, '');
        setNumeros(nums);
        setDepartamento('');
      }
    } else {
      setDepartamento('');
      setNumeros('');
    }
  }, [value]);

  // Actualizar el valor completo cuando cambian departamento o números
  const handleDepartamentoChange = (dept: DepartamentoPlaca) => {
    setDepartamento(dept);
    const nuevaPlaca = dept + numeros;
    onChange(nuevaPlaca);
  };

  const handleNumerosChange = (nums: string) => {
    // Solo permitir números, máximo 6 dígitos
    const soloNumeros = nums.replace(/\D/g, '').slice(0, 6);
    setNumeros(soloNumeros);
    const nuevaPlaca = departamento + soloNumeros;
    onChange(nuevaPlaca);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <div className="flex gap-2">
        {/* Selector de departamento */}
        <Select
          value={departamento}
          onValueChange={handleDepartamentoChange}
          disabled={disabled}
        >
          <SelectTrigger
            className={`w-[140px] ${error ? 'border-destructive' : ''}`}
          >
            <SelectValue placeholder="Dept." />
          </SelectTrigger>
          <SelectContent>
            {DEPARTAMENTOS_PLACA.map((dept) => (
              <SelectItem key={dept.value} value={dept.value}>
                {dept.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Input de números */}
        <Input
          type="text"
          inputMode="numeric"
          value={numeros}
          onChange={(e) => handleNumerosChange(e.target.value)}
          placeholder="566874"
          minLength={3}
          maxLength={6}
          className={`flex-1 ${error ? 'border-destructive' : ''}`}
          disabled={disabled}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {!error && numeros && (numeros.length < 3 || numeros.length > 6) && (
        <p className="text-sm text-amber-600">
          Los números deben tener entre 3 y 6 dígitos
        </p>
      )}
    </div>
  );
}

/**
 * Valida una placa en formato: departamento + números (3-6 dígitos)
 * Ejemplo: M566874, MY123456, GR123
 */
export function validatePlacaFormat(placa: string): {
  isValid: boolean;
  error?: string;
} {
  if (!placa || placa.trim().length === 0) {
    return { isValid: false, error: 'La placa es requerida' };
  }

  // Verificar que empiece con un departamento válido
  const dept = DEPARTAMENTOS_PLACA.find((d) => placa.startsWith(d.value));
  if (!dept) {
    return {
      isValid: false,
      error: 'La placa debe empezar con un departamento válido',
    };
  }

  // Extraer los números
  const numeros = placa.slice(dept.value.length);
  
  // Verificar que solo tenga números
  if (!/^\d+$/.test(numeros)) {
    return {
      isValid: false,
      error: 'La placa solo debe contener números después del departamento',
    };
  }

  // Verificar longitud de números (3-6 dígitos)
  if (numeros.length < 3) {
    return {
      isValid: false,
      error: 'La placa debe tener al menos 3 dígitos',
    };
  }

  if (numeros.length > 6) {
    return {
      isValid: false,
      error: 'La placa no puede tener más de 6 dígitos',
    };
  }

  return { isValid: true };
}

