import React from 'react';
import { AnalyticsRequest } from '@/types/analytics';
import { CalendarIcon, FunnelIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

interface AnalyticsFiltersProps {
  filters: AnalyticsRequest;
  onFiltersChange: (filters: AnalyticsRequest) => void;
  onExport: () => void;
  departments?: Array<{ id: number; name: string }>;
  teams?: Array<{ id: number; name: string }>;
  loading?: boolean;
}

export const AnalyticsFilters: React.FC<AnalyticsFiltersProps> = ({
  filters,
  onFiltersChange,
  onExport,
  departments = [],
  teams = [],
  loading = false
}) => {
  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    onFiltersChange({
      ...filters,
      [field]: value
    });
  };

  const handleDepartmentChange = (departmentId: number, checked: boolean) => {
    const currentDepartments = filters.departmentIds || [];
    const newDepartments = checked
      ? [...currentDepartments, departmentId]
      : currentDepartments.filter(id => id !== departmentId);
    
    onFiltersChange({
      ...filters,
      departmentIds: newDepartments
    });
  };

  const handleTeamChange = (teamId: number, checked: boolean) => {
    const currentTeams = filters.teamIds || [];
    const newTeams = checked
      ? [...currentTeams, teamId]
      : currentTeams.filter(id => id !== teamId);
    
    onFiltersChange({
      ...filters,
      teamIds: newTeams
    });
  };

  const handleGroupByChange = (groupBy: string) => {
    onFiltersChange({
      ...filters,
      groupBy: groupBy as any
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      groupBy: 'month'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <FunnelIcon className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filters & Options</h3>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={clearFilters}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          >
            Clear All
          </button>
          
          <button
            onClick={onExport}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <CalendarIcon className="w-4 h-4 inline mr-1" />
            Date Range
          </label>
          <div className="space-y-2">
            <input
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => handleDateChange('startDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <input
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => handleDateChange('endDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>

        {/* Group By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Group By
          </label>
          <select
            value={filters.groupBy || 'month'}
            onChange={(e) => handleGroupByChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
            <option value="quarter">Quarter</option>
            <option value="year">Year</option>
            <option value="department">Department</option>
            <option value="team">Team</option>
          </select>
        </div>

        {/* Departments */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Departments
          </label>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {departments.map((dept) => (
              <label key={dept.id} className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.departmentIds?.includes(dept.id) || false}
                  onChange={(e) => handleDepartmentChange(dept.id, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">{dept.name}</span>
              </label>
            ))}
            {departments.length === 0 && (
              <p className="text-sm text-gray-500">No departments available</p>
            )}
          </div>
        </div>

        {/* Teams */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Teams
          </label>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {teams.map((team) => (
              <label key={team.id} className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.teamIds?.includes(team.id) || false}
                  onChange={(e) => handleTeamChange(team.id, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">{team.name}</span>
              </label>
            ))}
            {teams.length === 0 && (
              <p className="text-sm text-gray-500">No teams available</p>
            )}
          </div>
        </div>
      </div>

      {/* Active Filters Summary */}
      {(filters.startDate || filters.endDate || filters.departmentIds?.length || filters.teamIds?.length) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Active Filters:</p>
          <div className="flex flex-wrap gap-2">
            {filters.startDate && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                From: {new Date(filters.startDate).toLocaleDateString()}
              </span>
            )}
            {filters.endDate && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                To: {new Date(filters.endDate).toLocaleDateString()}
              </span>
            )}
            {filters.departmentIds?.map((id) => {
              const dept = departments.find(d => d.id === id);
              return dept ? (
                <span key={id} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  {dept.name}
                </span>
              ) : null;
            })}
            {filters.teamIds?.map((id) => {
              const team = teams.find(t => t.id === id);
              return team ? (
                <span key={id} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                  {team.name}
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
};
