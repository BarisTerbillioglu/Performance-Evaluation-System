import React, { useState, useEffect } from 'react';
import { 
  ClockIcon, 
  UserIcon,
  ComputerDesktopIcon,

  ArrowDownTrayIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { DataTable, Column } from '@/components/ui/data';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/feedback';
import { Input, Select } from '@/components/ui/form';
import { useUIStore } from '@/stores';
import { auditService, AuditLogDto, AuditLogSearchRequest } from '@/services/auditService';


interface AuditTrailModalProps {
  userId?: number;
  entityType?: string;
  entityId?: number;
  title?: string;
}

export const AuditTrailModal: React.FC<AuditTrailModalProps> = ({ 
  userId, 
  entityType, 
  entityId,
  title = 'Audit Trail'
}) => {
  const { hideModal, showNotification } = useUIStore();
  const [auditLogs, setAuditLogs] = useState<AuditLogDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  
  // Filters
  const [filters, setFilters] = useState<{
    action: string;
    startDate: string;
    endDate: string;
    searchTerm: string;
  }>({
    action: '',
    startDate: '',
    endDate: '',
    searchTerm: ''
  });

  useEffect(() => {
    loadAuditLogs();
  }, [pagination.current, pagination.pageSize, filters, userId, entityType, entityId]);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      
      const searchRequest: AuditLogSearchRequest = {
        page: pagination.current,
        pageSize: pagination.pageSize,
        searchTerm: filters.searchTerm || undefined,
        action: filters.action || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined
      };

      let response;
      if (userId) {
        response = await auditService.getUserAuditLogs(userId, searchRequest);
      } else if (entityType && entityId) {
        response = await auditService.getEntityAuditLogs(entityType, entityId, searchRequest);
      } else {
        response = await auditService.getAuditLogs(searchRequest);
      }

      setAuditLogs(response.data);
      setPagination(prev => ({ ...prev, total: response.totalCount }));
    } catch (error) {
      console.error('Failed to load audit logs:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load audit logs'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, current: 1 })); // Reset to first page
  };

  const clearFilters = () => {
    setFilters({
      action: '',
      startDate: '',
      endDate: '',
      searchTerm: ''
    });
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      
      const searchRequest: AuditLogSearchRequest = {
        searchTerm: filters.searchTerm || undefined,
        action: filters.action || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        userId,
        entityType,
        entityId
      };

      const blob = await auditService.exportAuditLogs(searchRequest);
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit_trail_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showNotification({
        type: 'success',
        title: 'Export Completed',
        message: 'Audit trail exported successfully'
      });

    } catch (error) {
      console.error('Export failed:', error);
      showNotification({
        type: 'error',
        title: 'Export Failed',
        message: 'Failed to export audit trail'
      });
    } finally {
      setExporting(false);
    }
  };

  const handleClose = () => {
    hideModal('audit-trail');
  };

  const getActionBadgeVariant = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
      case 'created':
        return 'success';
      case 'update':
      case 'updated':
        return 'warning';
      case 'delete':
      case 'deleted':
        return 'error';
      case 'login':
      case 'logout':
        return 'info';
      default:
        return 'secondary';
    }
  };

  const formatChangeDetails = (log: AuditLogDto) => {
    if (!log.oldValues && !log.newValues) {
      return log.details || 'No details available';
    }

    const changes: string[] = [];
    
    if (log.newValues && log.oldValues) {
      // Update operation - show what changed
      Object.keys(log.newValues).forEach(key => {
        const oldValue = log.oldValues?.[key];
        const newValue = log.newValues?.[key];
        if (oldValue !== newValue) {
          changes.push(`${key}: "${oldValue}" → "${newValue}"`);
        }
      });
    } else if (log.newValues) {
      // Create operation - show new values
      Object.keys(log.newValues).forEach(key => {
        const newValue = log.newValues?.[key];
        changes.push(`${key}: "${newValue}"`);
      });
    }

    return changes.length > 0 ? changes.join(', ') : (log.details || 'No details available');
  };

  // Table columns
  const columns: Column<Record<string, any>>[] = [
    {
      key: 'timestamp',
      title: 'Date & Time',
      sortable: true,
      width: '180px',
      render: (value) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">
            {new Date(value).toLocaleDateString()}
          </div>
          <div className="text-gray-500">
            {new Date(value).toLocaleTimeString()}
          </div>
        </div>
      )
    },
    {
      key: 'userName',
      title: 'User',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-2">
          <UserIcon className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-900">{value}</span>
        </div>
      )
    },
    {
      key: 'action',
      title: 'Action',
      sortable: true,
      render: (value) => (
        <Badge variant={getActionBadgeVariant(value)}>
          {value}
        </Badge>
      )
    },
    {
      key: 'entityType',
      title: 'Entity',
      render: (value, record) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-gray-500">{record.entityName}</div>
        </div>
      )
    },
    {
      key: 'details',
      title: 'Details',
      render: (_, record) => (
        <div className="text-sm text-gray-600 max-w-xs truncate" title={formatChangeDetails(record)}>
          {formatChangeDetails(record)}
        </div>
      )
    },
    {
      key: 'ipAddress',
      title: 'IP Address',
      render: (value) => (
        <div className="flex items-center space-x-1 text-sm text-gray-500">
          <ComputerDesktopIcon className="h-4 w-4" />
          <span>{value}</span>
        </div>
      )
    }
  ];

  const activeFiltersCount = Object.values(filters).filter(value => value).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500 mt-1">
            Track all changes and actions performed in the system
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleExport}
          disabled={exporting}
          leftIcon={<ArrowDownTrayIcon className="w-4 h-4" />}
        >
          {exporting ? 'Exporting...' : 'Export'}
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 rounded-lg border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              leftIcon={<FunnelIcon className="w-4 h-4" />}
            >
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="primary" size="sm" className="ml-2">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="px-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <Input
                  placeholder="Search logs..."
                  value={filters.searchTerm}
                  onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Action
                </label>
                <Select
                  value={filters.action}
                  onChange={(value) => handleFilterChange('action', value.toString())}
                  options={[
                    { value: '', label: 'All Actions' },
                    { value: 'Create', label: 'Create' },
                    { value: 'Update', label: 'Update' },
                    { value: 'Delete', label: 'Delete' },
                    { value: 'Login', label: 'Login' },
                    { value: 'Logout', label: 'Logout' }
                  ]}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Audit Logs Table */}
      <DataTable
        data={auditLogs}
        columns={columns}
        loading={loading}
        rowKey="id"
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: (page, pageSize) => {
            setPagination(prev => ({ ...prev, current: page, pageSize }));
          },
          showTotal: (total, range) => `Showing ${range[0]}-${range[1]} of ${total} audit logs`
        }}
        expandable={{
          expandedRowRender: (record) => (
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Session Information</h4>
                  <div className="space-y-1 text-sm">
                    <div><span className="font-medium">IP Address:</span> {record.ipAddress}</div>
                    <div><span className="font-medium">User Agent:</span> {record.userAgent}</div>
                    <div><span className="font-medium">Timestamp:</span> {new Date(record.timestamp).toLocaleString()}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Change Details</h4>
                  <div className="text-sm">
                    {record.oldValues && Object.keys(record.oldValues).length > 0 && (
                      <div className="mb-2">
                        <span className="font-medium text-red-700">Before:</span>
                        <pre className="text-xs bg-red-50 p-2 rounded mt-1 overflow-auto">
                          {JSON.stringify(record.oldValues, null, 2)}
                        </pre>
                      </div>
                    )}
                    {record.newValues && Object.keys(record.newValues).length > 0 && (
                      <div>
                        <span className="font-medium text-green-700">After:</span>
                        <pre className="text-xs bg-green-50 p-2 rounded mt-1 overflow-auto">
                          {JSON.stringify(record.newValues, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        }}
        empty={
          <div className="text-center py-12">
            <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No audit logs found</h3>
            <p className="mt-1 text-sm text-gray-500">
              No activity has been recorded for the selected criteria.
            </p>
          </div>
        }
      />

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <Button variant="outline" onClick={handleClose}>
          Close
        </Button>
      </div>
    </div>
  );
};
