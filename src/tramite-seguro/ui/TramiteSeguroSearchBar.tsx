import { Search } from 'lucide-react';
import { CustomSearchControl } from '@/shared/components/custom/CustomSearchControl';

interface TramiteSeguroSearchBarProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const TramiteSeguroSearchBar = ({
  value,
  onValueChange,
  placeholder = 'Buscar por número, cliente, vehículo o aseguradora',
  className,
}: TramiteSeguroSearchBarProps) => {
  const containerClass = className
    ? `relative ${className}`
    : 'relative w-full';

  const handleChange = (next: string) => {
    onValueChange(next);
  };

  return (
    <div className={containerClass}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
      <CustomSearchControl
        value={value}
        onChange={handleChange}
        onKeyDown={handleChange}
        placeholder={placeholder}
        className="pl-10"
        ariaLabel="Buscar trámites de seguro"
        clearable
      />
    </div>
  );
};

export default TramiteSeguroSearchBar;
