import React, { useCallback, useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';

interface CustomSearchControlProps {
  value?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
  ariaLabel?: string;
  clearable?: boolean;
}

export const CustomSearchControl: React.FC<CustomSearchControlProps> = ({
  value,
  onChange,
  placeholder,
  debounceMs,
  className,
  ariaLabel,
  clearable = true,
}) => {
  const [internalValue, setInternalValue] = useState<string>(value ?? '');
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    setInternalValue(value ?? '');
  }, [value]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const triggerChange = useCallback(
    (val: string, immediate = false) => {
      if (!onChange) return;

      if (immediate || !debounceMs || debounceMs <= 0) {
        if (timerRef.current) {
          window.clearTimeout(timerRef.current);
        }
        onChange(val);
        return;
      }

      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
      timerRef.current = window.setTimeout(() => {
        onChange(val);
      }, debounceMs) as unknown as number;
    },
    [debounceMs, onChange]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setInternalValue(v);
    triggerChange(v);
  };

  const handleClear = () => {
    setInternalValue('');
    triggerChange('', true);
  };

  return (
    <div className="relative w-full">
      <Input
        value={internalValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={className}
        aria-label={ariaLabel}
      />
      {clearable && internalValue.length > 0 && onChange && (
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
