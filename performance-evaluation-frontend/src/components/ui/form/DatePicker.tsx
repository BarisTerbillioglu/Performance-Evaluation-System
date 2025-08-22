import React, { forwardRef, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { cn } from '@/utils/cn';
import { Button } from '../button';
import { Input } from './Input';

export interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  label?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  dateFormat?: string;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  showTimeSelect?: boolean;
}

const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  (
    {
      value,
      onChange,
      placeholder = 'Select date...',
      label,
      helperText,
      error,
      disabled = false,
      required = false,
      className,
      size = 'md',
      dateFormat = 'PPP',
      minDate,
      maxDate,
      disabledDates = [],
      showTimeSelect = false,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState(
      value ? format(value, dateFormat) : ''
    );

    const handleDateSelect = (date: Date | undefined) => {
      if (date) {
        setInputValue(format(date, dateFormat));
        onChange?.(date);
        setIsOpen(false);
      }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);
      
      // Try to parse the input value
      try {
        const parsedDate = new Date(newValue);
        if (!isNaN(parsedDate.getTime())) {
          onChange?.(parsedDate);
        }
      } catch {
        // Invalid date format, ignore
      }
    };

    const isDateDisabled = (date: Date) => {
      if (minDate && date < minDate) return true;
      if (maxDate && date > maxDate) return true;
      return disabledDates.some(disabledDate => 
        date.toDateString() === disabledDate.toDateString()
      );
    };

    return (
      <div className="relative">
        <Input
          ref={ref}
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          label={label}
          helperText={helperText}
          error={error}
          disabled={disabled}
          required={required}
          size={size}
          className={className}
          rightIcon={
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={() => setIsOpen(!isOpen)}
              disabled={disabled}
              tabIndex={-1}
            >
              <CalendarIcon className="h-4 w-4" />
            </Button>
          }
          onFocus={() => setIsOpen(true)}
          {...props}
        />

        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Calendar Popup */}
            <div className="absolute z-50 mt-1 p-3 bg-white border border-gray-200 rounded-lg shadow-lg">
              <DayPicker
                mode="single"
                selected={value}
                onSelect={handleDateSelect}
                disabled={isDateDisabled}
                className="rdp"
                classNames={{
                  months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
                  month: 'space-y-4',
                  caption: 'flex justify-center pt-1 relative items-center',
                  caption_label: 'text-sm font-medium',
                  nav: 'space-x-1 flex items-center',
                  nav_button: cn(
                    'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
                    'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100'
                  ),
                  nav_button_previous: 'absolute left-1',
                  nav_button_next: 'absolute right-1',
                  table: 'w-full border-collapse space-y-1',
                  head_row: 'flex',
                  head_cell: 'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
                  row: 'flex w-full mt-2',
                  cell: 'text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
                  day: cn(
                    'inline-flex items-center justify-center rounded-md text-sm font-normal',
                    'h-9 w-9 p-0 font-normal aria-selected:opacity-100'
                  ),
                  day_selected: 'bg-primary-600 text-white hover:bg-primary-600 hover:text-white focus:bg-primary-600 focus:text-white',
                  day_today: 'bg-accent text-accent-foreground',
                  day_outside: 'text-muted-foreground opacity-50',
                  day_disabled: 'text-muted-foreground opacity-50 cursor-not-allowed',
                  day_range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
                  day_hidden: 'invisible',
                }}
                components={{
                  IconLeft: ({ ...props }) => (
                    <svg {...props} className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="15,18 9,12 15,6" />
                    </svg>
                  ),
                  IconRight: ({ ...props }) => (
                    <svg {...props} className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9,18 15,12 9,6" />
                    </svg>
                  ),
                }}
              />
            </div>
          </>
        )}
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker';

export { DatePicker };
