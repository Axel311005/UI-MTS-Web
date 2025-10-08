import { useRef } from 'react';
import { useSearchParams } from 'react-router';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { X } from '@/shared/icons';

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
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      commit(inputRef.current?.value || '');
    }
  };

  const handleClear = () => {
    if (inputRef.current) inputRef.current.value = '';
    commit('');
  };

  return (
    <div className={`relative ${className}`}>
      <Input
        ref={inputRef}
        defaultValue={current}
        placeholder={placeholder}
        onKeyDown={handleKeyDown}
        aria-label="Buscar facturas"
        className="pr-8"
      />
      {current && (
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={handleClear}
          aria-label="Limpiar búsqueda"
          className="absolute right-1 top-1/2 -translate-y-1/2"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default FacturaSearch;
