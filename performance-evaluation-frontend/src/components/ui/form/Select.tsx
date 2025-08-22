import React, { forwardRef, Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/20/solid';
import { cn } from '@/utils/cn';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string | number;
  onChange?: (value: string | number) => void;
  placeholder?: string;
  label?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  multiple?: boolean;
}

const Select = forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      options,
      value,
      onChange,
      placeholder = 'Select an option...',
      label,
      helperText,
      error,
      disabled = false,
      required = false,
      className,
      size = 'md',
      multiple = false,
      ...props
    },
    ref
  ) => {
    const selectId = `select-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = error ? `${selectId}-error` : undefined;
    const helperTextId = helperText ? `${selectId}-helper` : undefined;

    const sizeClasses = {
      sm: 'h-8 px-2 text-xs',
      md: 'h-10 px-3 text-sm',
      lg: 'h-12 px-4 text-base',
    };

    const selectedOption = options.find(option => option.value === value);
    const displayValue = selectedOption ? selectedOption.label : placeholder;

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={selectId}
            className={cn(
              'text-sm font-medium leading-none',
              required && 'after:content-["*"] after:ml-0.5 after:text-red-500',
              disabled && 'opacity-70'
            )}
          >
            {label}
          </label>
        )}
        
        <Listbox
          value={value}
          onChange={(newValue) => onChange?.(newValue)}
          disabled={disabled}
          multiple={multiple}
        >
          {({ open }) => (
            <div className="relative">
              <Listbox.Button
                ref={ref}
                className={cn(
                  'relative w-full cursor-default rounded-md border bg-white py-2 pl-3 pr-10 text-left shadow-sm transition-colors',
                  'focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500',
                  'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500',
                  error
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300',
                  sizeClasses[size],
                  className
                )}
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby={cn(
                  error && errorId,
                  helperText && helperTextId
                )}
                {...props}
              >
                <span className={cn(
                  'block truncate',
                  !selectedOption && 'text-gray-500'
                )}>
                  {displayValue}
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronUpDownIcon
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </span>
              </Listbox.Button>

              <Transition
                show={open}
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  {options.map((option) => (
                    <Listbox.Option
                      key={option.value}
                      className={({ active, disabled: optionDisabled }) =>
                        cn(
                          'relative cursor-default select-none py-2 pl-3 pr-9',
                          active && !optionDisabled
                            ? 'bg-primary-600 text-white'
                            : 'text-gray-900',
                          optionDisabled && 'cursor-not-allowed opacity-50'
                        )
                      }
                      value={option.value}
                      disabled={option.disabled}
                    >
                      {({ selected, active }) => (
                        <>
                          <span
                            className={cn(
                              'block truncate',
                              selected ? 'font-medium' : 'font-normal'
                            )}
                          >
                            {option.label}
                          </span>
                          {selected ? (
                            <span
                              className={cn(
                                'absolute inset-y-0 right-0 flex items-center pr-4',
                                active ? 'text-white' : 'text-primary-600'
                              )}
                            >
                              <CheckIcon className="h-5 w-5" aria-hidden="true" />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          )}
        </Listbox>

        {error && (
          <p
            id={errorId}
            className="text-sm text-red-600"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}
        {helperText && !error && (
          <p
            id={helperTextId}
            className="text-sm text-gray-500"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };
