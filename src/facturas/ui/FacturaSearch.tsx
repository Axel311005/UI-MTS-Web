import { useSearchParams } from 'react-router';
import { CustomSearchControl } from '@/shared/components/custom/CustomSearchControl';

interface FacturaSearchProps {
  placeholder?: string;
  className?: string;
  paramName?: string;
}

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
