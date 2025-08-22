import React, { useState, useEffect } from 'react';
import { 
  X, 
  History, 
  Clock,
  User,
  FileText,
  Eye,
  RotateCcw,
  GitBranch,
  Edit,
  Plus,
  Trash,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button/Button';
import { Badge } from '@/components/ui/feedback/Badge';
import { Card } from '@/components/ui/layout/Card';
import { LoadingSpinner } from '@/components/ui/feedback/LoadingSpinner';

interface VersionHistoryModalProps {
  onClose: () => void;
}

interface VersionEntry {
  id: string;
  timestamp: string;
  user: string;
  action: 'create' | 'update' | 'delete' | 'reorder' | 'weight_change';
  entityType: 'category' | 'criteria' | 'role_description';
  entityName: string;
  changes: Array<{
    field: string;
    oldValue: any;
    newValue: any;
  }>;
  version: string;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  onClose
}) => {
  const [versions, setVersions] = useState<VersionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<VersionEntry | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'category' | 'criteria' | 'role_description'>('all');
  const [filterAction, setFilterAction] = useState<'all' | 'create' | 'update' | 'delete' | 'reorder' | 'weight_change'>('all');

  useEffect(() => {
    fetchVersionHistory();
  }, []);

  const fetchVersionHistory = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // Simulated data for demonstration
      const mockVersions: VersionEntry[] = [
        {
          id: '1',
          timestamp: '2024-01-15T10:30:00Z',
          user: 'John Doe',
          action: 'create',
          entityType: 'category',
          entityName: 'Technical Skills',
          changes: [
            { field: 'name', oldValue: null, newValue: 'Technical Skills' },
            { field: 'weight', oldValue: null, newValue: 40 },
            { field: 'description', oldValue: null, newValue: 'Technical competency evaluation' }
          ],
          version: '1.0'
        },
        {
          id: '2',
          timestamp: '2024-01-15T10:35:00Z',
          user: 'John Doe',
          action: 'create',
          entityType: 'criteria',
          entityName: 'Code Quality',
          changes: [
            { field: 'name', oldValue: null, newValue: 'Code Quality' },
            { field: 'categoryId', oldValue: null, newValue: 1 },
            { field: 'baseDescription', oldValue: null, newValue: 'Ability to write clean, maintainable code' }
          ],
          version: '1.1'
        },
        {
          id: '3',
          timestamp: '2024-01-15T11:00:00Z',
          user: 'Jane Smith',
          action: 'weight_change',
          entityType: 'category',
          entityName: 'Technical Skills',
          changes: [
            { field: 'weight', oldValue: 40, newValue: 45 }
          ],
          version: '1.2'
        },
        {
          id: '4',
          timestamp: '2024-01-15T11:15:00Z',
          user: 'Jane Smith',
          action: 'update',
          entityType: 'criteria',
          entityName: 'Code Quality',
          changes: [
            { field: 'baseDescription', oldValue: 'Ability to write clean, maintainable code', newValue: 'Ability to write clean, maintainable, and efficient code' }
          ],
          version: '1.3'
        },
        {
          id: '5',
          timestamp: '2024-01-15T14:20:00Z',
          user: 'Mike Johnson',
          action: 'create',
          entityType: 'role_description',
          entityName: 'Code Quality - Senior Developer',
          changes: [
            { field: 'roleId', oldValue: null, newValue: 2 },
            { field: 'description', oldValue: null, newValue: 'Expected to mentor others and establish coding standards' }
          ],
          version: '1.4'
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setVersions(mockVersions);
    } catch (error) {
      console.error('Error fetching version history:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVersions = versions.filter(version => {
    const typeMatch = filterType === 'all' || version.entityType === filterType;
    const actionMatch = filterAction === 'all' || version.action === filterAction;
    return typeMatch && actionMatch;
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create': return <Plus className="w-4 h-4 text-green-600" />;
      case 'update': return <Edit className="w-4 h-4 text-blue-600" />;
      case 'delete': return <Trash className="w-4 h-4 text-red-600" />;
      case 'reorder': return <GitBranch className="w-4 h-4 text-purple-600" />;
      case 'weight_change': return <RotateCcw className="w-4 h-4 text-yellow-600" />;
      default: return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create': return 'success';
      case 'update': return 'info';
      case 'delete': return 'error';
      case 'reorder': return 'secondary';
      case 'weight_change': return 'warning';
      default: return 'secondary';
    }
  };

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const handleRevert = async (version: VersionEntry) => {
    // TODO: Implement revert functionality
    console.log('Reverting to version:', version);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <History className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Version History
              </h2>
              <p className="text-sm text-gray-500">
                Track all changes made to criteria and categories
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

        <div className="flex h-[calc(90vh-120px)]">
          {/* Sidebar with Filters */}
          <div className="w-80 border-r bg-gray-50 p-6 overflow-y-auto">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Filter by Type
                </h3>
                <div className="space-y-2">
                  {[
                    { value: 'all', label: 'All Types' },
                    { value: 'category', label: 'Categories' },
                    { value: 'criteria', label: 'Criteria' },
                    { value: 'role_description', label: 'Role Descriptions' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFilterType(option.value as any)}
                      className={`w-full text-left p-2 rounded transition-colors ${
                        filterType === option.value
                          ? 'bg-blue-100 text-blue-900'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Filter by Action
                </h3>
                <div className="space-y-2">
                  {[
                    { value: 'all', label: 'All Actions' },
                    { value: 'create', label: 'Created' },
                    { value: 'update', label: 'Updated' },
                    { value: 'delete', label: 'Deleted' },
                    { value: 'reorder', label: 'Reordered' },
                    { value: 'weight_change', label: 'Weight Changed' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFilterAction(option.value as any)}
                      className={`w-full text-left p-2 rounded transition-colors ${
                        filterAction === option.value
                          ? 'bg-blue-100 text-blue-900'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Statistics
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Changes:</span>
                    <Badge variant="outline">{versions.length}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Version:</span>
                    <Badge variant="success">
                      {versions.length > 0 ? versions[0].version : '1.0'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner size="lg" />
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredVersions.length === 0 ? (
                    <div className="text-center py-12">
                      <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No History Found
                      </h3>
                      <p className="text-gray-500">
                        No version history matches your current filters.
                      </p>
                    </div>
                  ) : (
                    filteredVersions.map((version, index) => {
                      const datetime = formatDateTime(version.timestamp);
                      const isLatest = index === 0;
                      
                      return (
                        <Card key={version.id} className="overflow-hidden">
                          <div className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0">
                                  {getActionIcon(version.action)}
                                </div>
                                
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3 mb-2">
                                    <h4 className="font-medium text-gray-900">
                                      {version.entityName}
                                    </h4>
                                    <Badge
                                      variant={getActionColor(version.action) as any}
                                      size="sm"
                                    >
                                      {version.action.replace('_', ' ')}
                                    </Badge>
                                    <Badge variant="outline" size="sm">
                                      {version.entityType.replace('_', ' ')}
                                    </Badge>
                                    {isLatest && (
                                      <Badge variant="success" size="sm">
                                        Latest
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                                    <div className="flex items-center space-x-1">
                                      <User className="w-3 h-3" />
                                      <span>{version.user}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <Clock className="w-3 h-3" />
                                      <span>{datetime.date} at {datetime.time}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <GitBranch className="w-3 h-3" />
                                      <span>v{version.version}</span>
                                    </div>
                                  </div>

                                  {/* Changes Details */}
                                  <div className="space-y-2">
                                    {version.changes.map((change, changeIndex) => (
                                      <div 
                                        key={changeIndex}
                                        className="bg-gray-50 rounded p-3 text-sm"
                                      >
                                        <div className="font-medium text-gray-700 mb-1">
                                          {change.field}:
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <span className="text-red-600 bg-red-50 px-2 py-1 rounded">
                                            {change.oldValue || 'null'}
                                          </span>
                                          <ArrowRight className="w-3 h-3 text-gray-400" />
                                          <span className="text-green-600 bg-green-50 px-2 py-1 rounded">
                                            {change.newValue}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedVersion(version)}
                                  className="flex items-center space-x-1"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>View</span>
                                </Button>
                                {!isLatest && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRevert(version)}
                                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                                  >
                                    <RotateCcw className="w-3 h-3" />
                                    <span>Revert</span>
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Version Detail Modal */}
        {selectedVersion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  Version Details: v{selectedVersion.version}
                </h3>
                <button
                  onClick={() => setSelectedVersion(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Entity</label>
                      <p className="text-gray-900">{selectedVersion.entityName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Action</label>
                      <p className="text-gray-900">{selectedVersion.action.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">User</label>
                      <p className="text-gray-900">{selectedVersion.user}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Timestamp</label>
                      <p className="text-gray-900">
                        {formatDateTime(selectedVersion.timestamp).date} at {formatDateTime(selectedVersion.timestamp).time}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500 mb-2 block">Changes</label>
                    <div className="space-y-2">
                      {selectedVersion.changes.map((change, index) => (
                        <div key={index} className="border rounded p-3">
                          <div className="font-medium text-gray-700 mb-2">{change.field}</div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-xs text-gray-500">Before:</span>
                              <div className="bg-red-50 text-red-700 p-2 rounded text-sm">
                                {change.oldValue || 'null'}
                              </div>
                            </div>
                            <div>
                              <span className="text-xs text-gray-500">After:</span>
                              <div className="bg-green-50 text-green-700 p-2 rounded text-sm">
                                {change.newValue}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t p-6 flex justify-end">
                <Button onClick={() => setSelectedVersion(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
