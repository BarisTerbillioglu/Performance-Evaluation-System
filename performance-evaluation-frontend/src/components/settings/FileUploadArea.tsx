import React, { useState, useRef, useCallback } from 'react';
import { cn } from '../../utils/cn';

export interface FileUploadAreaProps {
  onFileSelect: (file: File) => void;
  onFileRemove?: () => void;
  acceptedFileTypes?: string[];
  maxFileSize?: number; // in MB
  label?: string;
  description?: string;
  placeholder?: string;
  currentFile?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  showPreview?: boolean;
  previewSize?: 'sm' | 'md' | 'lg';
}

const FileUploadArea: React.FC<FileUploadAreaProps> = ({
  onFileSelect,
  onFileRemove,
  acceptedFileTypes = ['image/*'],
  maxFileSize = 5, // 5MB default
  label,
  description,
  placeholder = 'Drag and drop a file here, or click to select',
  currentFile,
  disabled = false,
  className,
  id,
  showPreview = true,
  previewSize = 'md',
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    setError(null);

    // Check file type
    if (acceptedFileTypes.length > 0) {
      const isAccepted = acceptedFileTypes.some(type => {
        if (type.endsWith('/*')) {
          const baseType = type.replace('/*', '');
          return file.type.startsWith(baseType);
        }
        return file.type === type;
      });

      if (!isAccepted) {
        setError(`File type ${file.type} is not supported`);
        return false;
      }
    }

    // Check file size
    if (maxFileSize && file.size > maxFileSize * 1024 * 1024) {
      setError(`File size must be less than ${maxFileSize}MB`);
      return false;
    }

    return true;
  };

  const handleFileSelect = useCallback((file: File) => {
    if (validateFile(file)) {
      onFileSelect(file);
    }
  }, [onFileSelect, validateFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect, disabled]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFileRemove) {
      onFileRemove();
    }
  }, [onFileRemove]);

  const previewSizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label
          htmlFor={id}
          className={cn(
            'block text-sm font-medium mb-2',
            disabled ? 'text-gray-400' : 'text-gray-900'
          )}
        >
          {label}
        </label>
      )}

      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200',
          isDragOver
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-gray-400',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          id={id}
          accept={acceptedFileTypes.join(',')}
          onChange={handleFileInputChange}
          disabled={disabled}
          className="sr-only"
        />

        {currentFile && showPreview ? (
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <img
                src={currentFile}
                alt="Preview"
                className={cn(
                  'object-cover rounded-lg border border-gray-200',
                  previewSizeClasses[previewSize]
                )}
              />
              {onFileRemove && (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-200"
                  title="Remove file"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <p className="text-sm text-gray-600">Click to change file</p>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <div className="flex-shrink-0">
              <svg
                className={cn(
                  'mx-auto h-12 w-12',
                  isDragOver ? 'text-primary-500' : 'text-gray-400'
                )}
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="flex text-sm text-gray-600">
              <p className="pl-1">{placeholder}</p>
            </div>
            <p className="text-xs text-gray-500">
              {acceptedFileTypes.join(', ')} up to {maxFileSize}MB
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}

      {description && !error && (
        <p className={cn(
          'mt-2 text-sm',
          disabled ? 'text-gray-400' : 'text-gray-500'
        )}>
          {description}
        </p>
      )}
    </div>
  );
};

export default FileUploadArea;
