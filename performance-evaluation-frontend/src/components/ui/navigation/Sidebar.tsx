import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/utils/cn';
import { Badge } from '../feedback';
import { Button } from '../button';

export interface SidebarItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  path?: string;
  badge?: {
    count?: number;
    variant?: 'default' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
    dot?: boolean;
  };
  children?: SidebarItem[];
  disabled?: boolean;
  hidden?: boolean;
  onClick?: () => void;
}

export interface SidebarProps {
  items: SidebarItem[];
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  width?: number;
  collapsedWidth?: number;
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  theme?: 'light' | 'dark';
  collapsible?: boolean;
  defaultOpenKeys?: string[];
}

const Sidebar: React.FC<SidebarProps> = ({
  items,
  collapsed = false,
  onCollapse,
  width = 256,
  collapsedWidth = 64,
  className,
  header,
  footer,
  theme = 'light',
  collapsible = true,
  defaultOpenKeys = [],
}) => {
  const location = useLocation();
  const [openKeys, setOpenKeys] = useState<string[]>(defaultOpenKeys);

  const themeClasses = {
    light: {
      bg: 'bg-white border-gray-200',
      text: 'text-gray-700',
      activeText: 'text-primary-600',
      activeBg: 'bg-primary-50',
      hoverBg: 'hover:bg-gray-50',
      border: 'border-gray-200',
    },
    dark: {
      bg: 'bg-gray-800 border-gray-700',
      text: 'text-gray-300',
      activeText: 'text-white',
      activeBg: 'bg-primary-600',
      hoverBg: 'hover:bg-gray-700',
      border: 'border-gray-700',
    },
  };

  const currentTheme = themeClasses[theme];

  const isItemActive = (item: SidebarItem): boolean => {
    if (item.path) {
      return location.pathname === item.path ||
             (item.path !== '/' && location.pathname.startsWith(item.path));
    }
    
    if (item.children) {
      return item.children.some(child => isItemActive(child));
    }
    
    return false;
  };

  const toggleOpen = (key: string) => {
    setOpenKeys(prev => 
      prev.includes(key) 
        ? prev.filter(k => k !== key)
        : [...prev, key]
    );
  };

  const handleCollapse = () => {
    onCollapse?.(!collapsed);
  };

  const renderItem = (item: SidebarItem, level = 0) => {
    if (item.hidden) return null;

    const isActive = isItemActive(item);
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openKeys.includes(item.key);
    const itemClasses = cn(
      'flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors',
      'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
      level > 0 && 'ml-4',
      isActive
        ? `${currentTheme.activeBg} ${currentTheme.activeText}`
        : `${currentTheme.text} ${currentTheme.hoverBg}`,
      item.disabled && 'opacity-50 cursor-not-allowed'
    );

    const ItemContent = (
      <>
        {/* Icon */}
        {item.icon && (
          <span className={cn('flex-shrink-0', collapsed && level === 0 ? 'mx-auto' : 'mr-3')}>
            {item.icon}
          </span>
        )}
        
        {/* Label */}
        {(!collapsed || level > 0) && (
          <span className="flex-1 truncate">{item.label}</span>
        )}
        
        {/* Badge */}
        {item.badge && (!collapsed || level > 0) && (
          <Badge
            variant={item.badge.variant || 'default'}
            size="sm"
            dot={item.badge.dot}
            className="ml-auto"
          >
            {item.badge.dot ? '' : item.badge.count}
          </Badge>
        )}
        
        {/* Expand/Collapse Icon */}
        {hasChildren && (!collapsed || level > 0) && (
          <span className="ml-auto">
            {isOpen ? (
              <ChevronUpIcon className="w-4 h-4" />
            ) : (
              <ChevronDownIcon className="w-4 h-4" />
            )}
          </span>
        )}
      </>
    );

    const itemElement = item.path ? (
      <Link
        to={item.path}
        className={itemClasses}
        onClick={item.onClick}
        aria-disabled={item.disabled}
      >
        {ItemContent}
      </Link>
    ) : (
      <button
        className={itemClasses}
        onClick={() => {
          if (hasChildren && !item.disabled) {
            toggleOpen(item.key);
          }
          item.onClick?.();
        }}
        disabled={item.disabled}
        type="button"
      >
        {ItemContent}
      </button>
    );

    return (
      <li key={item.key}>
        {/* Tooltip for collapsed state */}
        {collapsed && level === 0 ? (
          <div className="group relative">
            {itemElement}
            <div className="invisible group-hover:visible absolute left-full top-0 ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-50">
              {item.label}
            </div>
          </div>
        ) : (
          itemElement
        )}
        
        {/* Children */}
        {hasChildren && isOpen && (!collapsed || level > 0) && (
          <ul className="mt-1 space-y-1">
            {item.children!.map(child => renderItem(child, level + 1))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <div
      className={cn(
        'flex flex-col h-full border-r transition-all duration-300',
        currentTheme.bg,
        currentTheme.border,
        className
      )}
      style={{
        width: collapsed ? collapsedWidth : width,
      }}
    >
      {/* Header */}
      {header && (
        <div className={cn('p-4 border-b', currentTheme.border)}>
          {header}
        </div>
      )}

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {items.map(item => renderItem(item))}
        </ul>
      </nav>

      {/* Footer */}
      {footer && (
        <div className={cn('p-4 border-t', currentTheme.border)}>
          {footer}
        </div>
      )}

      {/* Collapse Button */}
      {collapsible && (
        <div className={cn('p-4 border-t', currentTheme.border)}>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCollapse}
            className="w-full justify-center"
          >
            {collapsed ? (
              <ChevronRightIcon className="w-4 h-4" />
            ) : (
              <ChevronLeftIcon className="w-4 h-4" />
            )}
            {!collapsed && <span className="ml-2">Collapse</span>}
          </Button>
        </div>
      )}
    </div>
  );
};

Sidebar.displayName = 'Sidebar';

export { Sidebar };
