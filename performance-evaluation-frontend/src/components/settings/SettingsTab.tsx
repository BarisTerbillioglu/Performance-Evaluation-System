import React from 'react';
import { cn } from '../../utils/cn';

export interface SettingsTabProps {
  tabs: SettingsTabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export interface SettingsTabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  description?: string;
  badge?: string;
  disabled?: boolean;
}

const SettingsTab: React.FC<SettingsTabProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className,
}) => {
  return (
    <div className={cn('w-full', className)}>
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Settings tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && onTabChange(tab.id)}
              disabled={tab.disabled}
              className={cn(
                'group relative min-w-0 flex-1 overflow-hidden py-4 px-1 text-center text-sm font-medium focus:z-10 focus:outline-none',
                tab.disabled
                  ? 'cursor-not-allowed text-gray-400'
                  : 'cursor-pointer hover:text-gray-700',
                activeTab === tab.id
                  ? 'border-b-2 border-primary-500 text-primary-600'
                  : 'border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              )}
            >
              <div className="flex items-center justify-center space-x-2">
                {tab.icon && (
                  <span className="flex-shrink-0">
                    {tab.icon}
                  </span>
                )}
                <span className="truncate">{tab.label}</span>
                {tab.badge && (
                  <span className="inline-flex items-center rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-800">
                    {tab.badge}
                  </span>
                )}
              </div>
              {tab.description && (
                <p className="mt-1 text-xs text-gray-500 truncate">
                  {tab.description}
                </p>
              )}
              
              {/* Active tab indicator */}
              {activeTab === tab.id && (
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-primary-500" />
              )}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default SettingsTab;
