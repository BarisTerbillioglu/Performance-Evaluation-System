import React, { useState, useRef } from 'react';
import { 
  ArrowDownTrayIcon, 
  ArrowUpTrayIcon,
  DocumentArrowDownIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';

import { useUIStore } from '@/stores';


interface ImportExportModalProps {
  onImportSuccess?: () => void;
}

interface ImportResult {
  totalRows: number;
  successfulImports: number;
  failedImports: number;
  errors: Array<{
    row: number;
    email: string;
    error: string;
  }>;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({ onImportSuccess }) => {
  const { hideModal, showNotification } = useUIStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleClose = () => {
    hideModal('import-export');
  };

  const handleFileSelect = (file: File) => {
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      showNotification({
        type: 'error',
        title: 'Invalid File Type',
        message: 'Please select a CSV file'
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      showNotification({
        type: 'error',
        title: 'File Too Large',
        message: 'File size must be less than 5MB'
      });
      return;
    }

    setSelectedFile(file);
    setImportResult(null);
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const downloadTemplate = () => {
    const template = `firstName,lastName,email,departmentId,phoneNumber,jobTitle,roleIds,isActive
John,Doe,john.doe@company.com,1,"555-0123","Software Engineer","1,2",true
Jane,Smith,jane.smith@company.com,2,"555-0124","Marketing Manager","2,3",true`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user_import_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    setImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Mock import result - replace with actual API call
      const mockResult: ImportResult = {
        totalRows: 10,
        successfulImports: 8,
        failedImports: 2,
        errors: [
          {
            row: 3,
            email: 'invalid.email',
            error: 'Invalid email format'
          },
          {
            row: 7,
            email: 'duplicate@company.com',
            error: 'Email already exists'
          }
        ]
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setImportResult(mockResult);
      
      if (mockResult.successfulImports > 0) {
        onImportSuccess?.();
        showNotification({
          type: 'success',
          title: 'Import Completed',
          message: `Successfully imported ${mockResult.successfulImports} users`
        });
      }

    } catch (error) {
      console.error('Import failed:', error);
      showNotification({
        type: 'error',
        title: 'Import Failed',
        message: 'Failed to import users. Please try again.'
      });
    } finally {
      setImporting(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      // Mock export - replace with actual API call
      const csvData = `firstName,lastName,email,departmentName,roles,isActive,createdDate
John,Doe,john.doe@company.com,Engineering,"Admin,Developer",true,2024-01-15
Jane,Smith,jane.smith@company.com,Marketing,"Manager,Evaluator",true,2024-01-16`;

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showNotification({
        type: 'success',
        title: 'Export Completed',
        message: 'Users exported successfully'
      });

    } catch (error) {
      console.error('Export failed:', error);
      showNotification({
        type: 'error',
        title: 'Export Failed',
        message: 'Failed to export users. Please try again.'
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('import')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'import'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <ArrowUpTrayIcon className="w-5 h-5 inline mr-2" />
            Import Users
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'export'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <ArrowDownTrayIcon className="w-5 h-5 inline mr-2" />
            Export Users
          </button>
        </nav>
      </div>

      {/* Import Tab */}
      {activeTab === 'import' && (
        <div className="space-y-6">
          {!importResult ? (
            <>
              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <DocumentTextIcon className="h-6 w-6 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Import Instructions</h4>
                    <div className="mt-2 text-sm text-blue-700">
                      <ul className="list-disc list-inside space-y-1">
                        <li>Download the CSV template to see the required format</li>
                        <li>Fill in user information in the template</li>
                        <li>Upload the completed CSV file</li>
                        <li>Review the import results and fix any errors</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Template Download */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">CSV Template</h4>
                  <p className="text-sm text-gray-500">
                    Download the template to see the required format
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={downloadTemplate}
                  leftIcon={<DocumentArrowDownIcon className="w-4 h-4" />}
                >
                  Download Template
                </Button>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload CSV File
                </label>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center ${
                    dragOver
                      ? 'border-primary-400 bg-primary-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  {selectedFile ? (
                    <div className="space-y-2">
                      <DocumentTextIcon className="h-12 w-12 text-green-600 mx-auto" />
                      <div>
                        <p className="font-medium text-gray-900">{selectedFile.name}</p>
                        <p className="text-sm text-gray-500">
                          {(selectedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedFile(null)}
                      >
                        Remove File
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <ArrowUpTrayIcon className="h-12 w-12 text-gray-400 mx-auto" />
                      <div>
                        <p className="text-lg font-medium text-gray-900">
                          Drop your CSV file here
                        </p>
                        <p className="text-gray-500">or</p>
                        <Button
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Browse Files
                        </Button>
                      </div>
                      <p className="text-sm text-gray-500">
                        Maximum file size: 5MB
                      </p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>
            </>
          ) : (
            /* Import Results */
            <div className="space-y-6">
              <div className="text-center">
                {importResult.failedImports === 0 ? (
                  <CheckCircleIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
                ) : (
                  <ExclamationTriangleIcon className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                )}
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Import Complete
                </h3>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{importResult.totalRows}</div>
                    <div className="text-sm text-gray-600">Total Rows</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{importResult.successfulImports}</div>
                    <div className="text-sm text-gray-600">Successful</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">{importResult.failedImports}</div>
                    <div className="text-sm text-gray-600">Failed</div>
                  </div>
                </div>
              </div>

              {importResult.errors.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <XCircleIcon className="h-5 w-5 text-red-600 mr-2" />
                    Import Errors
                  </h4>
                  <div className="max-h-40 overflow-y-auto bg-red-50 border border-red-200 rounded-lg">
                    {importResult.errors.map((error, index) => (
                      <div key={index} className="p-3 border-b border-red-200 last:border-b-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-medium text-red-900">
                              Row {error.row}: {error.email}
                            </p>
                            <p className="text-sm text-red-700">{error.error}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Export Tab */}
      {activeTab === 'export' && (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <ArrowDownTrayIcon className="h-6 w-6 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-900">Export Users</h4>
                <p className="mt-1 text-sm text-green-700">
                  Export all users to a CSV file for backup or analysis purposes.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="font-medium text-gray-900 mb-4">Export Options</h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="include-inactive"
                  defaultChecked
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="include-inactive" className="text-sm text-gray-700">
                  Include inactive users
                </label>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="include-roles"
                  defaultChecked
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="include-roles" className="text-sm text-gray-700">
                  Include role assignments
                </label>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="include-personal"
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="include-personal" className="text-sm text-gray-700">
                  Include personal information (phone, job title)
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <Button variant="outline" onClick={handleClose}>
          {importResult ? 'Close' : 'Cancel'}
        </Button>
        
        {activeTab === 'import' && !importResult && (
          <Button
            onClick={handleImport}
            disabled={!selectedFile || importing}
            leftIcon={<ArrowUpTrayIcon className="w-4 h-4" />}
          >
            {importing ? 'Importing...' : 'Import Users'}
          </Button>
        )}
        
        {activeTab === 'export' && (
          <Button
            onClick={handleExport}
            disabled={exporting}
            leftIcon={<ArrowDownTrayIcon className="w-4 h-4" />}
          >
            {exporting ? 'Exporting...' : 'Export Users'}
          </Button>
        )}
        
        {importResult && importResult.successfulImports > 0 && (
          <Button
            onClick={() => {
              setSelectedFile(null);
              setImportResult(null);
            }}
          >
            Import More Users
          </Button>
        )}
      </div>
    </div>
  );
};
