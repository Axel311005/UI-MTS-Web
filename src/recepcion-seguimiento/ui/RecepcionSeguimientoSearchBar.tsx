import { useSearchParams } from 'react-router';
import { Search } from 'lucide-react';
import { CustomSearchControl } from '@/shared/components/custom/CustomSearchControl';

interface RecepcionSeguimientoSearchBarProps {
  placeholder?: string;
  className?: string;
  containerClassName?: string;
  paramName?: string;
}

export const RecepcionSeguimientoSearchBar = ({
  placeholder = 'Buscar por recepción, estado o descripción',
  className,
  containerClassName,
  paramName = 'q',
}: RecepcionSeguimientoSearchBarProps) => {
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

  const inputClassName = className ? `pl-9 ${className}` : 'pl-9';
  const wrapperClassName = containerClassName
    ? `relative ${containerClassName}`
    : 'relative';

  return (
    <div className={wrapperClassName}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
      <CustomSearchControl
        value={current}
        onKeyDown={commit}
        placeholder={placeholder}
        className={inputClassName}
        ariaLabel="Buscar seguimientos de recepción"
        clearable
      />
    </div>
  );
};

export default RecepcionSeguimientoSearchBar;

