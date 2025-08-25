import React, { useState } from 'react';
import { cn } from '../../utils/cn';

export interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  presetColors?: string[];
  showPresets?: boolean;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  onChange,
  label,
  description,
  disabled = false,
  className,
  id,
  presetColors = [
    '#FFD700', // VakıfBank Yellow
    '#1F2937', // Dark Gray
    '#3B82F6', // Blue
    '#10B981', // Green
    '#EF4444', // Red
    '#F59E0B', // Orange
    '#8B5CF6', // Purple
    '#06B6D4', // Cyan
  ],
  showPresets = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const colorPickerId = id || `color-picker-${Math.random().toString(36).substr(2, 9)}`;

  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  const handlePresetClick = (color: string) => {
    onChange(color);
  };

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label
          htmlFor={colorPickerId}
          className={cn(
            'block text-sm font-medium mb-2',
            disabled ? 'text-gray-400' : 'text-gray-900'
          )}
        >
          {label}
        </label>
      )}
      
      <div className="flex items-center space-x-3">
        {/* Color Preview */}
        <div className="relative">
          <button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className={cn(
              'w-12 h-12 rounded-lg border-2 border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200',
              disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-gray-300'
            )}
            style={{ backgroundColor: value }}
            aria-label="Select color"
          >
            <div className="w-full h-full rounded-md" />
          </button>
          
          {/* Color Input (Hidden) */}
          <input
            id={colorPickerId}
            type="color"
            value={value}
            onChange={handleColorChange}
            disabled={disabled}
            className="sr-only"
          />
        </div>

        {/* Color Value Display */}
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-mono text-gray-600">{value}</span>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(value)}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              title="Copy color value"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
          
          {description && (
            <p className={cn(
              'text-sm mt-1',
              disabled ? 'text-gray-400' : 'text-gray-500'
            )}>
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Preset Colors */}
      {showPresets && (
        <div className="mt-3">
          <p className="text-xs font-medium text-gray-700 mb-2">Preset Colors</p>
          <div className="flex flex-wrap gap-2">
            {presetColors.map((color, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handlePresetClick(color)}
                disabled={disabled}
                className={cn(
                  'w-8 h-8 rounded-lg border-2 border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200',
                  disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-gray-300 hover:scale-110',
                  value === color && 'ring-2 ring-primary-500 ring-offset-2'
                )}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      )}

      {/* Color Picker Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-10 mt-2 p-4 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="grid grid-cols-8 gap-2">
            {presetColors.map((color, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  handlePresetClick(color);
                  setIsOpen(false);
                }}
                className="w-6 h-6 rounded border border-gray-200 hover:border-gray-300 transition-colors duration-200"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPicker;
