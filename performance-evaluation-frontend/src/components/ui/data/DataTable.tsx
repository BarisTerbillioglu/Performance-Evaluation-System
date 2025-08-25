import React from 'react';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: string;
  title: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, record: T, index: number) => React.ReactNode;
}

export interface DataTableProps<T = any> {
  data: T[];
  columns: Column<T>[];
  className?: string;
  loading?: boolean;
  rowKey?: string;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
    showTotal: (total: number, range: [number, number]) => string;
  };
  onRow?: (record: T) => { onClick?: () => void };
  empty?: React.ReactNode;
}

export function DataTable<T = any>({ 
  data, 
  columns, 
  className, 
  loading = false,
  rowKey = 'id',
  pagination,
  onRow,
  empty
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className={cn("w-full", className)}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-2 text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={cn("w-full", className)}>
        {empty || (
          <div className="text-center py-8 text-gray-500">
            No data available
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-50">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-900"
                  style={column.width ? { width: column.width } : undefined}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((record, index) => {
              const rowProps = onRow ? onRow(record) : {};
              return (
                <tr 
                  key={(record as any)[rowKey] || index} 
                  className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                  onClick={rowProps.onClick}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="border border-gray-200 px-4 py-2 text-sm text-gray-900"
                    >
                      {column.render
                        ? column.render((record as any)[column.key], record, index)
                        : (record as any)[column.key]}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {pagination && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            {pagination.showTotal(pagination.total, [
              (pagination.current - 1) * pagination.pageSize + 1,
              Math.min(pagination.current * pagination.pageSize, pagination.total)
            ])}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => pagination.onChange(pagination.current - 1, pagination.pageSize)}
              disabled={pagination.current === 1}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm">
              Page {pagination.current} of {Math.ceil(pagination.total / pagination.pageSize)}
            </span>
            <button
              onClick={() => pagination.onChange(pagination.current + 1, pagination.pageSize)}
              disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
