import { useSearchParams } from 'react-router';
import { Search } from 'lucide-react';
import { CustomSearchControl } from '@/shared/components/custom/CustomSearchControl';
import { useDebounce } from '@/shared/hooks/use-debounce';

interface CotizacionSearchBarProps {
  placeholder?: string;
  className?: string;
  containerClassName?: string;
  paramName?: string;
}

export const CotizacionSearchBar = ({
  placeholder = 'Buscar por código, cliente o estado',
  className,
  containerClassName,
  paramName = 'q',
}: CotizacionSearchBarProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get(paramName) || '';
  useDebounce(initialSearch.trim().toLowerCase(), 300);

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
        value={initialSearch}
        onKeyDown={commit}
        placeholder={placeholder}
        className={inputClassName}
        ariaLabel="Buscar cotizaciones"
        clearable
      />
    </div>
  );
};

export default CotizacionSearchBar;

