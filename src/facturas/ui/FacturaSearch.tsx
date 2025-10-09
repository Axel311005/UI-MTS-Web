import { useSearchParams } from 'react-router';
import { CustomSearchControl } from '@/shared/components/custom/CustomSearchControl';

interface FacturaSearchProps {
  placeholder?: string;
  className?: string;
  paramName?: string; // nombre del query param (default 'q')
}

// Búsqueda sin useState: solo URLSearchParams. Actualiza al presionar Enter.
export const FacturaSearch = ({
  placeholder = 'Buscar por código',
  className = 'w-full',
  paramName = 'codigoLike',
}: FacturaSearchProps) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const current = searchParams.get(paramName) || '';

  const commit = (raw: string) => {
    const value = raw.trim();
    setSearchParams((prev) => {
      if (value) prev.set(paramName, value);
      else prev.delete(paramName);
      // reset page if exists
      prev.delete('page');
      return prev;
    });
  };

  return (
    <CustomSearchControl
      value={current}
      onKeyDown={commit}
      placeholder={placeholder}
      className={className}
      ariaLabel="Buscar facturas"
      clearable
    />
  );
};

export default FacturaSearch;
