import { useState } from 'react';
import { CustomSearchControl } from '@/shared/components/custom/CustomSearchControl';

// Componente sólo de diseño (UI). La lógica de filtros/búsqueda se añadirá luego.
interface FacturaSearchProps {
  placeholder?: string;
  initialValue?: string;
  debounceMs?: number;
  className?: string;
}

export const FacturaSearch = ({
  placeholder = 'Buscar facturas',
  initialValue = '',
  debounceMs = 500,
  className = 'w-full',
}: FacturaSearchProps) => {
  const [value, setValue] = useState(initialValue);

  const handleChange = (v: string) => setValue(v);

  return (
    <div className="flex-1">
      <CustomSearchControl
        value={value}
        onChange={handleChange}
        placeholder={`${placeholder} (solo UI)`}
        debounceMs={debounceMs}
        className={className}
        ariaLabel="Buscar facturas"
        clearable
      />
    </div>
  );
};

export default FacturaSearch;
