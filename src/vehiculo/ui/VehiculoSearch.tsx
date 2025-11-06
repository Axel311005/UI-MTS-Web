import { useSearchParams } from 'react-router';
import { CustomSearchControl } from '@/shared/components/custom/CustomSearchControl';

interface VehiculoSearchProps {
  placeholder?: string;
  className?: string;
  paramName?: string;
}

export const VehiculoSearch = ({
  placeholder = 'Buscar por placa, marca, modelo, año, color o cliente',
  className = 'w-full',
  paramName = 'q',
}: VehiculoSearchProps) => {
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
      ariaLabel="Buscar vehículos"
      clearable
    />
  );
};

export default VehiculoSearch;
