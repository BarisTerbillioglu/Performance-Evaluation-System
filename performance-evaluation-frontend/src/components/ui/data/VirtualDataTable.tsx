import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { cn } from '../../../utils/cn';

export interface VirtualDataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  rowHeight?: number;
  containerHeight?: number;
  className?: string;
  onRowClick?: (item: T, index: number) => void;
  selectedRow?: number;
  loading?: boolean;
  emptyMessage?: string;
}

export interface Column<T> {
  key: string;
  header: string;
  width?: number | string;
  render?: (value: any, item: T, index: number) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
}

const VirtualDataTable = React.memo(<T extends Record<string, any>>({
  data,
  columns,
  rowHeight = 48,
  containerHeight = 400,
  className,
  onRowClick,
  selectedRow,
  loading = false,
  emptyMessage = 'No data available',
}: VirtualDataTableProps<T>) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate virtual scrolling values
  const totalHeight = data.length * rowHeight;
  const visibleRows = Math.ceil(containerHeight / rowHeight);
  const startIndex = Math.floor(scrollTop / rowHeight);
  const endIndex = Math.min(startIndex + visibleRows + 1, data.length);
  const offsetY = startIndex * rowHeight;

  // Sort data if needed
  const sortedData = useMemo(() => {
    if (!sortColumn) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortColumn, sortDirection]);

  // Get visible data slice
  const visibleData = useMemo(() => {
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, startIndex, endIndex]);

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // Handle column sort
  const handleSort = useCallback((columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  }, [sortColumn, sortDirection]);

  // Handle row click
  const handleRowClick = useCallback((item: T, index: number) => {
    onRowClick?.(item, startIndex + index);
  }, [onRowClick, startIndex]);

  // Reset scroll position when data changes
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
      setScrollTop(0);
    }
  }, [data.length]);

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center h-64', className)}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={cn('flex items-center justify-center h-64', className)}>
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </svg>
          <p className="mt-2 text-gray-600">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('border border-gray-200 rounded-lg overflow-hidden', className)}>
      {/* Table Header */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="flex">
          {columns.map((column) => (
            <div
              key={column.key}
              className={cn(
                'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                column.width && { width: column.width },
                column.align === 'center' && 'text-center',
                column.align === 'right' && 'text-right',
                column.sortable && 'cursor-pointer hover:bg-gray-100'
              )}
              onClick={() => column.sortable && handleSort(column.key)}
            >
              <div className="flex items-center space-x-1">
                <span>{column.header}</span>
                {column.sortable && sortColumn === column.key && (
                  <svg
                    className={cn(
                      'w-4 h-4',
                      sortDirection === 'asc' ? 'rotate-180' : ''
                    )}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 15l7-7 7 7"
                    />
                  </svg>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Virtual Table Body */}
      <div
        ref={containerRef}
        className="overflow-auto"
        style={{ height: containerHeight }}
        onScroll={handleScroll}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              top: offsetY,
              left: 0,
              right: 0,
            }}
          >
            {visibleData.map((item, index) => (
              <div
                key={startIndex + index}
                className={cn(
                  'flex border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150',
                  selectedRow === startIndex + index && 'bg-primary-50 border-primary-200',
                  onRowClick && 'cursor-pointer'
                )}
                style={{ height: rowHeight }}
                onClick={() => handleRowClick(item, index)}
              >
                {columns.map((column) => (
                  <div
                    key={column.key}
                    className={cn(
                      'px-4 py-3 text-sm text-gray-900 flex items-center',
                      column.width && { width: column.width },
                      column.align === 'center' && 'justify-center',
                      column.align === 'right' && 'justify-end'
                    )}
                  >
                    {column.render
                      ? column.render(item[column.key], item, startIndex + index)
                      : item[column.key]}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table Footer */}
      <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 text-sm text-gray-500">
        Showing {startIndex + 1} to {Math.min(endIndex, data.length)} of {data.length} results
      </div>
    </div>
  );
});

VirtualDataTable.displayName = 'VirtualDataTable';

export default VirtualDataTable;
