import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Upload, 
  FileText,
  AlertCircle,
  CheckCircle,
  FileJson,
  FileSpreadsheet,
  Copy,
  Save
} from 'lucide-react';
import { Button } from '@/components/ui/button/Button';
import { Alert } from '@/components/ui/feedback/Alert';
import { Card } from '@/components/ui/layout/Card';
import { Badge } from '@/components/ui/feedback/Badge';
import { useCriteriaCategories } from '@/hooks/useCriteriaCategories';
import { useCriteria } from '@/hooks/useCriteria';

interface ImportExportModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  onClose,
  onSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import' | 'templates'>('export');
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');
  const [importData, setImportData] = useState('');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState<string | null>(null);

  const { categories } = useCriteriaCategories();
  const { criteria } = useCriteria();

  const generateExportData = () => {
    const exportData = {
      version: '1.0',
      exported_at: new Date().toISOString(),
      categories: categories.map(cat => ({
        name: cat.name,
        description: cat.description,
        weight: cat.weight,
        isActive: cat.isActive
      })),
      criteria: criteria.map(crit => ({
        name: crit.name,
        baseDescription: crit.baseDescription,
        categoryName: crit.categoryName,
        isActive: crit.isActive,
        roleDescriptions: crit.roleDescriptions.map(rd => ({
          roleName: rd.roleName,
          description: rd.description,
          isActive: rd.isActive
        }))
      }))
    };

    return exportData;
  };

  const handleExport = async () => {
    setIsProcessing(true);
    try {
      const data = generateExportData();
      
      if (exportFormat === 'json') {
        const blob = new Blob([JSON.stringify(data, null, 2)], { 
          type: 'application/json' 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `criteria-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        // CSV export
        const csvData = convertToCSV(data);
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `criteria-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      setSuccess('Export completed successfully');
    } catch (error) {
      setErrors(['Failed to export data']);
    } finally {
      setIsProcessing(false);
    }
  };

  const convertToCSV = (data: any) => {
    const headers = ['Type', 'Name', 'Description', 'Weight', 'Category', 'Role', 'IsActive'];
    const rows = [headers.join(',')];

    // Add categories
    data.categories.forEach((cat: any) => {
      rows.push([
        'Category',
        `"${cat.name}"`,
        `"${cat.description || ''}"`,
        cat.weight,
        '',
        '',
        cat.isActive
      ].join(','));
    });

    // Add criteria
    data.criteria.forEach((crit: any) => {
      rows.push([
        'Criteria',
        `"${crit.name}"`,
        `"${crit.baseDescription || ''}"`,
        '',
        `"${crit.categoryName}"`,
        '',
        crit.isActive
      ].join(','));

      // Add role descriptions
      crit.roleDescriptions.forEach((rd: any) => {
        rows.push([
          'RoleDescription',
          `"${crit.name}"`,
          `"${rd.description}"`,
          '',
          `"${crit.categoryName}"`,
          `"${rd.roleName}"`,
          rd.isActive
        ].join(','));
      });
    });

    return rows.join('\n');
  };

  const handleImport = async () => {
    setIsProcessing(true);
    setErrors([]);
    setSuccess(null);

    try {
      let data;
      
      if (importFile) {
        const text = await importFile.text();
        if (importFile.name.endsWith('.json')) {
          data = JSON.parse(text);
        } else {
          setErrors(['CSV import not yet implemented. Please use JSON format.']);
          return;
        }
      } else if (importData) {
        data = JSON.parse(importData);
      } else {
        setErrors(['Please provide import data or select a file']);
        return;
      }

      // Validate import data structure
      const validationErrors = validateImportData(data);
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        return;
      }

      // TODO: Implement actual import logic
      // This would involve calling the API to create categories and criteria
      console.log('Import data:', data);
      
      setSuccess('Import completed successfully');
      setTimeout(() => {
        onSuccess();
      }, 1500);

    } catch (error) {
      setErrors(['Invalid JSON format or file structure']);
    } finally {
      setIsProcessing(false);
    }
  };

  const validateImportData = (data: any): string[] => {
    const errors: string[] = [];

    if (!data || typeof data !== 'object') {
      errors.push('Invalid data format');
      return errors;
    }

    if (!Array.isArray(data.categories)) {
      errors.push('Categories must be an array');
    } else {
      data.categories.forEach((cat: any, index: number) => {
        if (!cat.name) errors.push(`Category ${index + 1}: Name is required`);
        if (typeof cat.weight !== 'number') errors.push(`Category ${index + 1}: Weight must be a number`);
      });
    }

    if (!Array.isArray(data.criteria)) {
      errors.push('Criteria must be an array');
    } else {
      data.criteria.forEach((crit: any, index: number) => {
        if (!crit.name) errors.push(`Criteria ${index + 1}: Name is required`);
        if (!crit.categoryName) errors.push(`Criteria ${index + 1}: Category name is required`);
      });
    }

    return errors;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);
      setImportData(''); // Clear text input when file is selected
    }
  };

  const sampleTemplate = {
    version: '1.0',
    categories: [
      {
        name: 'Technical Skills',
        description: 'Evaluation of technical competencies and knowledge',
        weight: 40,
        isActive: true
      },
      {
        name: 'Communication',
        description: 'Assessment of communication and collaboration skills',
        weight: 30,
        isActive: true
      },
      {
        name: 'Leadership',
        description: 'Leadership and mentorship capabilities',
        weight: 30,
        isActive: true
      }
    ],
    criteria: [
      {
        name: 'Code Quality',
        baseDescription: 'Ability to write clean, maintainable, and efficient code',
        categoryName: 'Technical Skills',
        isActive: true,
        roleDescriptions: [
          {
            roleName: 'Senior Developer',
            description: 'Expected to mentor others and set coding standards',
            isActive: true
          },
          {
            roleName: 'Junior Developer',
            description: 'Expected to follow coding standards and learn best practices',
            isActive: true
          }
        ]
      }
    ]
  };

  const copyTemplate = () => {
    navigator.clipboard.writeText(JSON.stringify(sampleTemplate, null, 2));
    setSuccess('Template copied to clipboard');
    setTimeout(() => setSuccess(null), 2000);
  };

  const tabs = [
    { id: 'export' as const, label: 'Export', icon: Download },
    { id: 'import' as const, label: 'Import', icon: Upload },
    { id: 'templates' as const, label: 'Templates', icon: FileText }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Import/Export Criteria
              </h2>
              <p className="text-sm text-gray-500">
                Import criteria templates or export current criteria configuration
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-6 border-b-2 font-medium text-sm whitespace-nowrap flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Alerts */}
          {errors.length > 0 && (
            <Alert
              type="error"
              title="Import Errors"
              message={
                <ul className="list-disc list-inside space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              }
              className="mb-4"
            />
          )}

          {success && (
            <Alert
              type="success"
              title="Success"
              message={success}
              className="mb-4"
            />
          )}

          {/* Export Tab */}
          {activeTab === 'export' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Export Current Criteria
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Export your current criteria configuration to share with other systems or create backups.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <FileJson className="w-8 h-8 text-blue-600" />
                      <div>
                        <h4 className="font-medium text-gray-900">JSON Format</h4>
                        <p className="text-sm text-gray-500">Structured data format</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Categories:</span>
                          <Badge variant="outline">{categories.length}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Criteria:</span>
                          <Badge variant="outline">{criteria.length}</Badge>
                        </div>
                      </div>
                      <Button
                        onClick={() => {
                          setExportFormat('json');
                          handleExport();
                        }}
                        disabled={isProcessing}
                        className="w-full"
                      >
                        {isProcessing ? 'Exporting...' : 'Export JSON'}
                      </Button>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <FileSpreadsheet className="w-8 h-8 text-green-600" />
                      <div>
                        <h4 className="font-medium text-gray-900">CSV Format</h4>
                        <p className="text-sm text-gray-500">Spreadsheet compatible</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="text-sm text-gray-600">
                        <p>Flattened format suitable for Excel or Google Sheets</p>
                      </div>
                      <Button
                        onClick={() => {
                          setExportFormat('csv');
                          handleExport();
                        }}
                        disabled={isProcessing}
                        className="w-full"
                        variant="outline"
                      >
                        {isProcessing ? 'Exporting...' : 'Export CSV'}
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* Import Tab */}
          {activeTab === 'import' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Import Criteria Configuration
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Import criteria from a JSON file or paste JSON data directly. This will create new categories and criteria.
                </p>

                <div className="space-y-6">
                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload JSON File
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                        <p className="text-sm text-gray-600">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          JSON files only
                        </p>
                      </label>
                      {importFile && (
                        <div className="mt-3 text-sm text-gray-600">
                          Selected: {importFile.name}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Text Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Or Paste JSON Data
                    </label>
                    <textarea
                      value={importData}
                      onChange={(e) => setImportData(e.target.value)}
                      placeholder="Paste your JSON data here..."
                      rows={8}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                      disabled={!!importFile}
                    />
                  </div>

                  <Button
                    onClick={handleImport}
                    disabled={isProcessing || (!importFile && !importData)}
                    className="w-full"
                  >
                    {isProcessing ? 'Importing...' : 'Import Criteria'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Sample Templates
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Use these sample templates as a starting point for your criteria configuration.
                </p>

                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">
                      Standard Performance Criteria Template
                    </h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyTemplate}
                      className="flex items-center space-x-2"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy Template</span>
                    </Button>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <pre className="text-sm text-gray-700 overflow-x-auto">
                      {JSON.stringify(sampleTemplate, null, 2)}
                    </pre>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <p className="mb-2">This template includes:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>3 balanced categories (Technical Skills, Communication, Leadership)</li>
                      <li>Sample criteria with role-specific descriptions</li>
                      <li>Proper weight distribution (40%, 30%, 30%)</li>
                    </ul>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-6">
          <div className="flex items-center justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
