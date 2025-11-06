import React, { useEffect, useState } from 'react';
import { X } from '@/shared/icons';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';

interface CustomSearchControlProps {
  value?: string;
  onKeyDown?: (v: string) => void;
  onChange?: (v: string) => void;
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
  clearable?: boolean;
}

export const CustomSearchControl: React.FC<CustomSearchControlProps> = ({
  value,
  onKeyDown,
  onChange,
  placeholder,
  className,
  ariaLabel,
  clearable = true,
}) => {
  const [internalValue, setInternalValue] = useState<string>(value ?? '');

  useEffect(() => {
    setInternalValue(value ?? '');
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = e.target.value;
    setInternalValue(nextValue);
    onChange?.(nextValue);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onKeyDown) {
      onKeyDown(internalValue);
    }
  };

  const handleClear = () => {
    setInternalValue('');
    onChange?.('');
    if (onKeyDown) onKeyDown('');
  };

  return (
    <div className="relative w-full">
      <Input
        value={internalValue}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        placeholder={placeholder}
        className={className}
        aria-label={ariaLabel}
      />
      {clearable && internalValue.length > 0 && (
        <div className="absolute right-1 top-1/2 -translate-y-1/2">
          <Button
            size="icon"
            variant="ghost"
            onClick={handleClear}
            aria-label="Limpiar búsqueda"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
};
