# Ejemplos de Uso de Validaciones Inteligentes

## Validaciones Implementadas

### 1. Validación Inteligente Completa (`smartValidate`)

```typescript
import { smartValidate } from '@/shared/utils/validation';

// Validación básica
const result = smartValidate('Juan Pérez', {
  minLength: 2,
  maxLength: 100,
  allowNumbers: false,
  allowSpecialChars: false,
  maxRepetitions: 3,
  maxConsonantsInRow: 4,
  maxRepetitivePercentage: 50,
  maxSymbolPercentage: 20,
});

if (!result.isValid) {
  console.error(result.error);
  // Ejemplo: "No puede tener más de 3 caracteres iguales seguidos"
}
```

### 2. Validadores Específicos por Tipo

```typescript
import { 
  validateName, 
  validateAddress, 
  validateDescription,
  validateCode,
  validateSearch 
} from '@/shared/utils/validation';

// Validar nombre
const nameResult = validateName('María González');
if (!nameResult.isValid) {
  console.error(nameResult.error);
}

// Validar dirección
const addressResult = validateAddress('Calle Principal #123');
if (!addressResult.isValid) {
  console.error(addressResult.error);
}

// Validar descripción
const descResult = validateDescription('Producto de alta calidad');
if (!descResult.isValid) {
  console.error(descResult.error);
}

// Validar código
const codeResult = validateCode('PROD-001');
if (!codeResult.isValid) {
  console.error(codeResult.error);
}

// Validar búsqueda (más permisiva)
const searchResult = validateSearch('motor');
if (!searchResult.isValid) {
  console.error(searchResult.error);
}
```

### 3. Uso en Formularios React

```typescript
import { useState } from 'react';
import { validateName } from '@/shared/utils/validation';

function MyForm() {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);

    // Validar en tiempo real
    const result = validateName(value);
    if (!result.isValid) {
      setError(result.error || 'Nombre inválido');
    } else {
      setError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = validateName(name);
    if (!result.isValid) {
      setError(result.error || 'Nombre inválido');
      return;
    }

    // Enviar formulario
    console.log('Formulario válido:', name);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={name}
        onChange={handleNameChange}
        placeholder="Nombre"
      />
      {error && <span className="error">{error}</span>}
      <button type="submit">Enviar</button>
    </form>
  );
}
```

### 4. Uso con Hook de Validación Existente

```typescript
import { useFieldValidation } from '@/shared/hooks/useFieldValidation';
import { validateName } from '@/shared/utils/validation';

function MyComponent() {
  const {
    value,
    error,
    isValid,
    handleChange,
    validateField,
  } = useFieldValidation('', {
    validate: (val) => {
      const result = validateName(val);
      return {
        isValid: result.isValid,
        error: result.error,
      };
    },
    validateOnChange: true,
    validateOnBlur: true,
  });

  return (
    <div>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onBlur={validateField}
      />
      {error && <span>{error}</span>}
    </div>
  );
}
```

## Lo que se Bloquea

### ❌ Ejemplos de Inputs Bloqueados:

1. **Repeticiones excesivas:**
   - `"aaaaaaa"` ❌ (más de 3 caracteres iguales)
   - `"1111111"` ❌
   - `"jjjjjjjj"` ❌

2. **Consonantes excesivas:**
   - `"asdfg"` ❌ (5 consonantes sin vocales)
   - `"krtplm"` ❌
   - `"brrrttt"` ❌

3. **Texto demasiado repetitivo:**
   - `"aaaaaaaaaaa"` ❌ (más del 50% del mismo carácter)
   - `"lolololololololololo"` ❌

4. **Demasiados símbolos:**
   - `"a=1&b=2&c=3"` ❌ (más del 20% son símbolos)
   - `"test@#$%^&*()"` ❌

5. **Caracteres peligrosos:**
   - `"test<script>"` ❌
   - `"test' OR 1=1"` ❌

### ✅ Ejemplos de Inputs Permitidos:

1. **Nombres válidos:**
   - `"María González"` ✅
   - `"Juan Pérez"` ✅
   - `"Christopher"` ✅

2. **Direcciones válidas:**
   - `"Calle Principal #123"` ✅
   - `"Avenida 5 de Mayo"` ✅

3. **Códigos válidos:**
   - `"PROD-001"` ✅
   - `"ABC123"` ✅

4. **Descripciones válidas:**
   - `"Producto de alta calidad"` ✅
   - `"Servicio técnico especializado"` ✅

## Configuración Personalizada

Puedes personalizar las validaciones según tus necesidades:

```typescript
import { smartValidate } from '@/shared/utils/validation';

// Validación muy estricta
const strictResult = smartValidate(text, {
  minLength: 5,
  maxLength: 50,
  allowNumbers: false,
  allowSpecialChars: false,
  maxRepetitions: 2, // Solo 2 repeticiones
  maxConsonantsInRow: 3, // Solo 3 consonantes
  maxRepetitivePercentage: 30, // Solo 30% repetitivo
  maxSymbolPercentage: 5, // Solo 5% símbolos
  allowedChars: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, // Solo letras y espacios
});

// Validación más permisiva
const lenientResult = smartValidate(text, {
  minLength: 1,
  maxLength: 200,
  allowNumbers: true,
  allowSpecialChars: true,
  maxRepetitions: 5,
  maxConsonantsInRow: 6,
  maxRepetitivePercentage: 60,
  maxSymbolPercentage: 30,
});
```

