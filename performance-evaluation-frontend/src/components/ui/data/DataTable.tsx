import React, { useState, useMemo } from 'react';
import {
  ChevronUpDownIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/utils/cn';
import { Button } from '../button';
import { Input } from '../form';
import { Badge } from '../feedback';

export interface Column<T> {
  key: keyof T | string;
  title: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  minWidth?: string;
  maxWidth?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, record: T, index: number) => React.ReactNode;
  sorter?: (a: T, b: T) => number;
  filterDropdown?: React.ReactNode;
  filterIcon?: React.ReactNode;
  onFilter?: (value: string, record: T) => boolean;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    showSizeChanger?: boolean;
    showQuickJumper?: boolean;
    showTotal?: (total: number, range: [number, number]) => React.ReactNode;
    onChange?: (page: number, pageSize: number) => void;
  };
  rowKey?: keyof T | ((record: T) => string | number);
  rowSelection?: {
    selectedRowKeys?: (string | number)[];
    onChange?: (selectedRowKeys: (string | number)[], selectedRows: T[]) => void;
    getCheckboxProps?: (record: T) => { disabled?: boolean };
  };
  expandable?: {
    expandedRowRender: (record: T, index: number) => React.ReactNode;
    expandedRowKeys?: (string | number)[];
    onExpand?: (expanded: boolean, record: T) => void;
  };
  onRow?: (record: T, index: number) => {
    onClick?: () => void;
    onDoubleClick?: () => void;
    className?: string;
  };
  scroll?: {
    x?: number | string;
    y?: number | string;
  };
  size?: 'small' | 'middle' | 'large';
  bordered?: boolean;
  showHeader?: boolean;
  title?: () => React.ReactNode;
  footer?: () => React.ReactNode;
  empty?: React.ReactNode;
  className?: string;
}

type SortOrder = 'ascend' | 'descend' | null;

interface SortState {
  columnKey: string;
  order: SortOrder;
}

const DataTable = React.memo(<T extends Record<string, any>>(
  props: DataTableProps<T>
): React.ReactElement => {
  const {
    data,
    columns,
    loading = false,
    pagination,
    rowKey = 'id',
    rowSelection,
    expandable,
    onRow,
    scroll,
    size = 'middle',
    bordered = false,
    showHeader = true,
    title,
    footer,
    empty,
    className,
  } = props;

  const [sortState, setSortState] = useState<SortState>({ columnKey: '', order: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedKeys, setExpandedKeys] = useState<(string | number)[]>(
    expandable?.expandedRowKeys || []
  );
  const [selectedKeys, setSelectedKeys] = useState<(string | number)[]>(
    rowSelection?.selectedRowKeys || []
  );

  // Get row key
  const getRowKey = (record: T, index: number): string | number => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return record[rowKey] || index;
  };

  // Sort and filter data
  const processedData = useMemo(() => {
    let result = [...data];

    // Apply search filter
    if (searchTerm) {
      result = result.filter((record) => {
        return columns.some((column) => {
          const value = record[column.key as keyof T];
          if (value == null) return false;
          return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        });
      });
    }

    // Apply sorting
    if (sortState.columnKey && sortState.order) {
      const column = columns.find((col) => col.key === sortState.columnKey);
      if (column) {
        result.sort((a, b) => {
          if (column.sorter) {
            return column.sorter(a, b);
          }
          
          const aValue = a[column.key as keyof T];
          const bValue = b[column.key as keyof T];
          
          if (aValue < bValue) return sortState.order === 'ascend' ? -1 : 1;
          if (aValue > bValue) return sortState.order === 'ascend' ? 1 : -1;
          return 0;
        });
      }
    }

    return result;
  }, [data, columns, sortState, searchTerm]);

  // Pagination
  const paginatedData = useMemo(() => {
    if (!pagination) return processedData;
    
    const { current, pageSize } = pagination;
    const start = (current - 1) * pageSize;
    const end = start + pageSize;
    
    return processedData.slice(start, end);
  }, [processedData, pagination]);

  // Handle sort
  const handleSort = (columnKey: string) => {
    const column = columns.find((col) => col.key === columnKey);
    if (!column?.sortable) return;

    let order: SortOrder = 'ascend';
    if (sortState.columnKey === columnKey) {
      if (sortState.order === 'ascend') {
        order = 'descend';
      } else if (sortState.order === 'descend') {
        order = null;
      }
    }

    setSortState({ columnKey: order ? columnKey : '', order });
  };

  // Handle row selection
  const handleRowSelect = (key: string | number, selected: boolean) => {
    const newSelectedKeys = selected
      ? [...selectedKeys, key]
      : selectedKeys.filter((k) => k !== key);
    
    setSelectedKeys(newSelectedKeys);
    
    const selectedRows = data.filter((record, index) => {
      const recordKey = getRowKey(record, index);
      return newSelectedKeys.includes(recordKey);
    });
    
    rowSelection?.onChange?.(newSelectedKeys, selectedRows);
  };

  // Handle select all
  const handleSelectAll = (selected: boolean) => {
    const allKeys = paginatedData.map((record, index) => getRowKey(record, index));
    const newSelectedKeys = selected ? allKeys : [];
    
    setSelectedKeys(newSelectedKeys);
    
    const selectedRows = selected ? paginatedData : [];
    rowSelection?.onChange?.(newSelectedKeys, selectedRows);
  };

  // Handle expand
  const handleExpand = (key: string | number, record: T) => {
    const isExpanded = expandedKeys.includes(key);
    const newExpandedKeys = isExpanded
      ? expandedKeys.filter((k) => k !== key)
      : [...expandedKeys, key];
    
    setExpandedKeys(newExpandedKeys);
    expandable?.onExpand?.(!isExpanded, record);
  };

  // Size classes
  const sizeClasses = {
    small: 'text-xs',
    middle: 'text-sm',
    large: 'text-base',
  };

  const cellPaddingClasses = {
    small: 'px-3 py-2',
    middle: 'px-4 py-3',
    large: 'px-6 py-4',
  };

  // Render sort icon
  const renderSortIcon = (column: Column<T>) => {
    if (!column.sortable) return null;

    const isActive = sortState.columnKey === column.key;
    const order = isActive ? sortState.order : null;

    if (order === 'ascend') {
      return <ChevronUpIcon className="w-4 h-4 text-primary-600" />;
    } else if (order === 'descend') {
      return <ChevronDownIcon className="w-4 h-4 text-primary-600" />;
    }
    
    return <ChevronUpDownIcon className="w-4 h-4 text-gray-400" />;
  };

  // Render cell content
  const renderCell = (column: Column<T>, record: T, index: number) => {
    const value = record[column.key as keyof T];
    
    if (column.render) {
      return column.render(value, record, index);
    }
    
    return value;
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {title && title()}
        </div>
        
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative">
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<MagnifyingGlassIcon className="w-4 h-4" />}
              className="w-full sm:w-64"
            />
          </div>
          
          {/* Row selection info */}
          {rowSelection && selectedKeys.length > 0 && (
            <Badge variant="info">
              {selectedKeys.length} selected
            </Badge>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden border border-gray-200 rounded-lg">
        <div
          className="overflow-auto"
          style={{
            maxHeight: scroll?.y,
            maxWidth: scroll?.x,
          }}
        >
          <table className={cn('min-w-full divide-y divide-gray-200', sizeClasses[size])}>
            {showHeader && (
              <thead className="bg-gray-50">
                <tr>
                  {/* Row selection column */}
                  {rowSelection && (
                    <th className={cn('w-12', cellPaddingClasses[size])}>
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        checked={selectedKeys.length === paginatedData.length && paginatedData.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                    </th>
                  )}
                  
                  {/* Expand column */}
                  {expandable && (
                    <th className={cn('w-12', cellPaddingClasses[size])} />
                  )}
                  
                  {/* Data columns */}
                  {columns.map((column) => (
                    <th
                      key={String(column.key)}
                      className={cn(
                        'text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                        cellPaddingClasses[size],
                        column.sortable && 'cursor-pointer hover:bg-gray-100 user-select-none',
                        column.align === 'center' && 'text-center',
                        column.align === 'right' && 'text-right'
                      )}
                      style={{
                        width: column.width,
                        minWidth: column.minWidth,
                        maxWidth: column.maxWidth,
                      }}
                      onClick={() => handleSort(String(column.key))}
                    >
                      <div className="flex items-center gap-1">
                        <span>{column.title}</span>
                        {renderSortIcon(column)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={columns.length + (rowSelection ? 1 : 0) + (expandable ? 1 : 0)}
                    className={cn('text-center text-gray-500', cellPaddingClasses[size])}
                  >
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-600 border-t-transparent" />
                      <span className="ml-2">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (rowSelection ? 1 : 0) + (expandable ? 1 : 0)}
                    className={cn('text-center text-gray-500', cellPaddingClasses[size])}
                  >
                    {empty || (
                      <div className="py-8">
                        <p>No data available</p>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedData.map((record, index) => {
                  const key = getRowKey(record, index);
                  const isSelected = selectedKeys.includes(key);
                  const isExpanded = expandedKeys.includes(key);
                  const rowProps = onRow?.(record, index) || {};
                  
                  return (
                    <React.Fragment key={key}>
                      <tr
                        className={cn(
                          'hover:bg-gray-50 transition-colors',
                          isSelected && 'bg-primary-50',
                          rowProps.className
                        )}
                        onClick={rowProps.onClick}
                        onDoubleClick={rowProps.onDoubleClick}
                      >
                        {/* Row selection */}
                        {rowSelection && (
                          <td className={cellPaddingClasses[size]}>
                            <input
                              type="checkbox"
                              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                              checked={isSelected}
                              onChange={(e) => handleRowSelect(key, e.target.checked)}
                              {...rowSelection.getCheckboxProps?.(record)}
                            />
                          </td>
                        )}
                        
                        {/* Expand */}
                        {expandable && (
                          <td className={cellPaddingClasses[size]}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleExpand(key, record)}
                            >
                              <ChevronDownIcon
                                className={cn(
                                  'w-4 h-4 transition-transform',
                                  isExpanded && 'rotate-180'
                                )}
                              />
                            </Button>
                          </td>
                        )}
                        
                        {/* Data cells */}
                        {columns.map((column) => (
                          <td
                            key={String(column.key)}
                            className={cn(
                              'text-gray-900 whitespace-nowrap',
                              cellPaddingClasses[size],
                              column.align === 'center' && 'text-center',
                              column.align === 'right' && 'text-right'
                            )}
                          >
                            {renderCell(column, record, index)}
                          </td>
                        ))}
                      </tr>
                      
                      {/* Expanded row */}
                      {expandable && isExpanded && (
                        <tr>
                          <td
                            colSpan={columns.length + (rowSelection ? 1 : 0) + 1}
                            className="bg-gray-50 p-4"
                          >
                            {expandable.expandedRowRender(record, index)}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            {pagination.showTotal
              ? pagination.showTotal(pagination.total, [
                  (pagination.current - 1) * pagination.pageSize + 1,
                  Math.min(pagination.current * pagination.pageSize, pagination.total),
                ])
              : `Showing ${(pagination.current - 1) * pagination.pageSize + 1} to ${
                  Math.min(pagination.current * pagination.pageSize, pagination.total)
                } of ${pagination.total} results`}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.current <= 1}
              onClick={() => pagination.onChange?.(pagination.current - 1, pagination.pageSize)}
            >
              <ChevronLeftIcon className="w-4 h-4" />
              Previous
            </Button>
            
            <span className="text-sm text-gray-700">
              Page {pagination.current} of {Math.ceil(pagination.total / pagination.pageSize)}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
              onClick={() => pagination.onChange?.(pagination.current + 1, pagination.pageSize)}
            >
              Next
              <ChevronRightIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Footer */}
      {footer && footer()}
    </div>
  );
});

DataTable.displayName = 'DataTable';

export { DataTable };
