import { useState, useMemo } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/components/ui/command';

export interface SearchableSelectOption {
  value: string | number;
  label: string;
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value?: string | number | '';
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = 'Selecciona una opción',
  searchPlaceholder = 'Buscar...',
  emptyMessage = 'No se encontraron resultados.',
  disabled = false,
  className,
  id,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);

  const selectedOption = useMemo(() => {
    if (!value) return null;
    return options.find((opt) => String(opt.value) === String(value));
  }, [options, value]);

  const handleSelect = (selectedValue: string) => {
    onValueChange(selectedValue);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between',
            !selectedOption && 'text-muted-foreground',
            className
          )}
          disabled={disabled}
        >
          {selectedOption ? selectedOption.label : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={String(option.value)}
                  value={option.label}
                  keywords={[option.label, String(option.value)]}
                  onSelect={() => handleSelect(String(option.value))}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      String(option.value) === String(value)
                        ? 'opacity-100'
                        : 'opacity-0'
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

