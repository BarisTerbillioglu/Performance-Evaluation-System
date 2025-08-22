import React, { useState } from 'react';
import { 
  Home,
  Users,
  FileText,
  BarChart3,
  Settings,
  Calendar,
  Bell,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Building,
  Target,
  Award,
  Shield,
  HelpCircle
} from 'lucide-react';
import { Button, Badge } from '../design-system';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  current: boolean;
  badge?: number;
  children?: NavItem[];
}

export const SidebarNavigation: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const navigation: NavItem[] = [
    {
      name: 'Dashboard',
      href: '#',
      icon: Home,
      current: true
    },
    {
      name: 'Employees',
      href: '#',
      icon: Users,
      current: false,
      badge: 12
    },
    {
      name: 'Evaluations',
      href: '#',
      icon: FileText,
      current: false,
      children: [
        { name: 'Active Evaluations', href: '#', icon: Target, current: false },
        { name: 'Completed', href: '#', icon: Award, current: false },
        { name: 'Templates', href: '#', icon: FileText, current: false }
      ]
    },
    {
      name: 'Reports',
      href: '#',
      icon: BarChart3,
      current: false
    },
    {
      name: 'Calendar',
      href: '#',
      icon: Calendar,
      current: false
    },
    {
      name: 'Departments',
      href: '#',
      icon: Building,
      current: false
    },
    {
      name: 'Settings',
      href: '#',
      icon: Settings,
      current: false,
      children: [
        { name: 'General', href: '#', icon: Settings, current: false },
        { name: 'Security', href: '#', icon: Shield, current: false },
        { name: 'Notifications', href: '#', icon: Bell, current: false }
      ]
    }
  ];

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  const renderNavItem = (item: NavItem, level: number = 0) => {
    const isExpanded = expandedItems.includes(item.name);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.name}>
        <a
          href={item.href}
          className={`flex items-center px-4 py-3 text-sm font-medium transition-colors duration-200 ${
            level > 0 ? 'pl-8' : ''
          } ${
            item.current
              ? 'bg-primary-50 text-primary-500 border-r-2 border-primary-500'
              : 'text-black hover:bg-primary-50 hover:text-primary-500'
          }`}
          onClick={(e) => {
            if (hasChildren) {
              e.preventDefault();
              toggleExpanded(item.name);
            }
          }}
        >
          <item.icon className={`h-4 w-4 ${level > 0 ? 'mr-3' : 'mr-3'}`} />
          {!collapsed && (
            <>
              <span className="flex-1">{item.name}</span>
              {item.badge && (
                <Badge variant="primary" size="sm" className="ml-2">
                  {item.badge}
                </Badge>
              )}
              {hasChildren && (
                <ChevronRight 
                  className={`h-4 w-4 ml-2 transition-transform duration-200 ${
                    isExpanded ? 'rotate-90' : ''
                  }`} 
                />
              )}
            </>
          )}
        </a>
        
        {hasChildren && !collapsed && isExpanded && (
          <div className="bg-gray-50">
            {item.children!.map(child => renderNavItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          {!collapsed && (
            <div className="flex items-center">
              <div className="h-8 w-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">VB</span>
              </div>
              <div className="ml-3">
                <h1 className="text-lg font-semibold text-black">
                  Performance
                </h1>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="p-1"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="mt-4 flex-1 overflow-y-auto">
          {navigation.map(item => renderNavItem(item))}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          {!collapsed && (
            <div className="space-y-2">
              <div className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50">
                <div className="h-8 w-8 bg-primary-500 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-black">John Doe</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" className="flex-1">
                  <HelpCircle className="h-4 w-4" />
                  {!collapsed && <span className="ml-2">Help</span>}
                </Button>
                <Button variant="ghost" size="sm" className="flex-1">
                  <LogOut className="h-4 w-4" />
                  {!collapsed && <span className="ml-2">Logout</span>}
                </Button>
              </div>
            </div>
          )}
          
          {collapsed && (
            <div className="space-y-2">
              <Button variant="ghost" size="sm" className="w-full p-2">
                <User className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="w-full p-2">
                <HelpCircle className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="w-full p-2">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-50">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-black mb-4">
            {collapsed ? 'Dashboard' : 'Performance Evaluation System'}
          </h2>
          <p className="text-gray-500">
            Welcome to your performance evaluation dashboard. Use the sidebar navigation to access different sections of the system.
          </p>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-black mb-2">Quick Stats</h3>
              <p className="text-gray-500">This is where your dashboard content would go.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-black mb-2">Recent Activity</h3>
              <p className="text-gray-500">Recent activities and notifications would appear here.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-black mb-2">Quick Actions</h3>
              <p className="text-gray-500">Common actions and shortcuts would be available here.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarNavigation;
