import React, { useState, useEffect } from 'react';
import { ReportExecution, ReportFilter, ReportExportOptions } from '@/types/reports';
import { reportService } from '@/services/reportService';
import { 
  PlayIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ArrowDownTrayIcon,
  EyeIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

interface ReportExecutionProps {
  reportId: string;
  reportName: string;
  onClose: () => void;
}

export const ReportExecution: React.FC<ReportExecutionProps> = ({
  reportId,
  reportName,
  onClose
}) => {
  const [executions, setExecutions] = useState<ReportExecution[]>([]);
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [filters, setFilters] = useState<ReportFilter[]>([]);
  const [exportOptions, setExportOptions] = useState<ReportExportOptions>({
    format: 'pdf',
    includeCharts: true,
    includeFilters: true,
    includeSummary: true
  });

  useEffect(() => {
    loadExecutions();
  }, [reportId]);

  const loadExecutions = async () => {
    try {
      setLoading(true);
      const data = await reportService.getExecutions(reportId);
      setExecutions(data);
    } catch (error) {
      console.error('Failed to load executions:', error);
    } finally {
      setLoading(false);
    }
  };

  const executeReport = async () => {
    try {
      setExecuting(true);
      const execution = await reportService.executeReport(reportId, filters, exportOptions);
      setExecutions(prev => [execution, ...prev]);
      
      // Poll for status updates
      const pollInterval = setInterval(async () => {
        try {
          const updatedExecution = await reportService.getExecution(execution.id);
          setExecutions(prev => 
            prev.map(exec => 
              exec.id === execution.id ? updatedExecution : exec
            )
          );
          
          if (updatedExecution.status === 'completed' || updatedExecution.status === 'failed') {
            clearInterval(pollInterval);
            setExecuting(false);
          }
        } catch (error) {
          console.error('Failed to poll execution status:', error);
          clearInterval(pollInterval);
          setExecuting(false);
        }
      }, 2000);
      
    } catch (error) {
      console.error('Failed to execute report:', error);
      setExecuting(false);
    }
  };

  const downloadExecution = async (execution: ReportExecution) => {
    try {
      const blob = await reportService.downloadExecution(execution.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${execution.reportName}-${new Date(execution.startedAt).toISOString().split('T')[0]}.${execution.format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download execution:', error);
    }
  };

  const cancelExecution = async (executionId: string) => {
    try {
      await reportService.cancelExecution(executionId);
      setExecutions(prev => 
        prev.map(exec => 
          exec.id === executionId 
            ? { ...exec, status: 'cancelled' as const }
            : exec
        )
      );
    } catch (error) {
      console.error('Failed to cancel execution:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <XCircleIcon className="w-5 h-5 text-red-600" />;
      case 'running':
        return <ClockIcon className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'pending':
        return <ClockIcon className="w-5 h-5 text-yellow-600" />;
      case 'cancelled':
        return <XCircleIcon className="w-5 h-5 text-gray-600" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'running':
        return 'text-blue-600 bg-blue-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'cancelled':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Execute Report</h2>
            <p className="text-sm text-gray-600">{reportName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Execution Options */}
        <div className="mb-6">
          <h3 className="text-md font-medium text-gray-900 mb-4">Execution Options</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Export Format
              </label>
              <select
                value={exportOptions.format}
                onChange={(e) => setExportOptions(prev => ({ ...prev, format: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
                <option value="csv">CSV</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Options
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeCharts}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, includeCharts: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Include Charts</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeFilters}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, includeFilters: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Include Filters</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeSummary}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, includeSummary: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Include Summary</span>
                </label>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <button
              onClick={executeReport}
              disabled={executing}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <PlayIcon className="w-4 h-4" />
              <span>{executing ? 'Executing...' : 'Execute Report'}</span>
            </button>
          </div>
        </div>

        {/* Execution History */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-md font-medium text-gray-900">Execution History</h3>
            <button
              onClick={loadExecutions}
              disabled={loading}
              className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Loading executions...</p>
            </div>
          ) : executions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ClockIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No executions found</p>
              <p className="text-sm">Execute the report to see history</p>
            </div>
          ) : (
            <div className="space-y-3">
              {executions.map((execution) => (
                <ExecutionItem
                  key={execution.id}
                  execution={execution}
                  onDownload={() => downloadExecution(execution)}
                  onCancel={() => cancelExecution(execution.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Execution Item Component
const ExecutionItem: React.FC<{
  execution: ReportExecution;
  onDownload: () => void;
  onCancel: () => void;
}> = ({ execution, onDownload, onCancel }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <XCircleIcon className="w-5 h-5 text-red-600" />;
      case 'running':
        return <ClockIcon className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'pending':
        return <ClockIcon className="w-5 h-5 text-yellow-600" />;
      case 'cancelled':
        return <XCircleIcon className="w-5 h-5 text-gray-600" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'running':
        return 'text-blue-600 bg-blue-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'cancelled':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return '-';
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}m ${seconds}s`;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '-';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getStatusIcon(execution.status)}
          <div>
            <p className="text-sm font-medium text-gray-900">
              {execution.reportName}
            </p>
            <p className="text-xs text-gray-500">
              Started: {new Date(execution.startedAt).toLocaleString()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(execution.status)}`}>
            {execution.status}
          </span>
          
          {execution.status === 'completed' && (
            <button
              onClick={onDownload}
              className="text-blue-600 hover:text-blue-700"
              title="Download"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
            </button>
          )}
          
          {(execution.status === 'pending' || execution.status === 'running') && (
            <button
              onClick={onCancel}
              className="text-red-600 hover:text-red-700"
              title="Cancel"
            >
              <XCircleIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      
      <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-500">
        <div>
          <span className="font-medium">Duration:</span> {formatDuration(execution.duration)}
        </div>
        <div>
          <span className="font-medium">Records:</span> {execution.recordCount || '-'}
        </div>
        <div>
          <span className="font-medium">File Size:</span> {formatFileSize(execution.fileSize)}
        </div>
        <div>
          <span className="font-medium">Format:</span> {execution.format.toUpperCase()}
        </div>
      </div>
      
      {execution.errorMessage && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">
            <span className="font-medium">Error:</span> {execution.errorMessage}
          </p>
        </div>
      )}
    </div>
  );
};
