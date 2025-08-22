import React, { useState } from 'react';
import { 
  Bell, 
  Search, 
  User, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  ChevronDown,
  Home,
  BarChart3,
  Users,
  FileText,
  Calendar,
  Building
} from 'lucide-react';
import { Button, Badge } from './index';

export interface HeaderProps {
  title?: string;
  user?: {
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
  notifications?: Array<{
    id: number;
    message: string;
    time: string;
    unread: boolean;
  }>;
  navigation?: Array<{
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    current: boolean;
  }>;
  onLogout?: () => void;
  onSearch?: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'Performance Evaluation System',
  user = {
    name: 'John Doe',
    email: 'john.doe@company.com',
    role: 'Administrator'
  },
  notifications = [],
  navigation = [
    { name: 'Dashboard', href: '#', icon: Home, current: true },
    { name: 'Employees', href: '#', icon: Users, current: false },
    { name: 'Evaluations', href: '#', icon: FileText, current: false },
    { name: 'Reports', href: '#', icon: BarChart3, current: false },
    { name: 'Calendar', href: '#', icon: Calendar, current: false },
    { name: 'Departments', href: '#', icon: Building, current: false },
  ],
  onLogout,
  onSearch
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand Area (Yellow) */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="h-10 w-10 bg-primary-500 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-lg">VB</span>
              </div>
              <div className="hidden md:block">
                <h1 className="text-xl font-semibold text-black">
                  {title}
                </h1>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors duration-200 ${
                  item.current
                    ? 'text-primary-500 border-b-2 border-primary-500'
                    : 'text-black hover:text-primary-500'
                }`}
              >
                <item.icon className="h-4 w-4 mr-2" />
                {item.name}
              </a>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="hidden md:block">
              <form onSubmit={handleSearch} className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-64 pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </form>
            </div>

            {/* Notifications */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="relative p-2"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              >
                <Bell className="h-5 w-5 text-black" />
                {unreadCount > 0 && (
                  <Badge
                    variant="error"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>

              {/* Notifications dropdown */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-black mb-4">Notifications</h3>
                    <div className="space-y-3">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-3 rounded-lg border ${
                              notification.unread
                                ? 'bg-primary-50 border-primary-200'
                                : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <p className="text-sm font-medium text-black">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {notification.time}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-4">No notifications</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User menu */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-2 p-2"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              >
                <div className="h-8 w-8 bg-primary-500 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-black">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.role}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </Button>

              {/* User dropdown */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <p className="text-sm font-medium text-black">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <div className="p-2">
                    <a
                      href="#"
                      className="flex items-center px-3 py-2 text-sm text-black hover:bg-gray-50 rounded-md"
                    >
                      <User className="h-4 w-4 mr-3" />
                      Profile
                    </a>
                    <a
                      href="#"
                      className="flex items-center px-3 py-2 text-sm text-black hover:bg-gray-50 rounded-md"
                    >
                      <Settings className="h-4 w-4 mr-3" />
                      Settings
                    </a>
                    <button
                      onClick={onLogout}
                      className="flex items-center w-full px-3 py-2 text-sm text-black hover:bg-gray-50 rounded-md"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2 text-base font-medium rounded-md transition-colors duration-200 ${
                  item.current
                    ? 'bg-primary-50 text-primary-500'
                    : 'text-black hover:bg-gray-50 hover:text-primary-500'
                }`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
