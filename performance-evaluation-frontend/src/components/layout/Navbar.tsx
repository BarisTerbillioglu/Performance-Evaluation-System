import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/store';
import { Button } from '@/components/common';
import { formatFullName, filterMenuItems, MenuItem } from '@/utils';
import { UserRole } from '@/types/roles';

// Define menu items with role-based access
const menuItems: MenuItem[] = [
  {
    path: '/dashboard',
    label: 'Dashboard',
  },
  {
    path: '/evaluations',
    label: 'Evaluations',
  },
  {
    path: '/users',
    label: 'Users',
    requiredRoles: [UserRole.ADMIN],
  },
  {
    path: '/criteria',
    label: 'Criteria',
    requiredRoles: [UserRole.ADMIN],
  },
  {
    path: '/departments',
    label: 'Departments',
    requiredRoles: [UserRole.ADMIN],
  },
  {
    path: '/teams',
    label: 'Teams',
    requiredRoles: [UserRole.ADMIN, UserRole.MANAGER],
  },
  {
    path: '/reports',
    label: 'Reports',
    requiredRoles: [UserRole.ADMIN, UserRole.MANAGER],
  },
];

export const Navbar: React.FC = () => {
  const { state, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Filter menu items based on user permissions
  const allowedMenuItems = filterMenuItems(state.user, menuItems);

  const isActivePath = (path: string) => {
    return location.pathname === path || 
           (path !== '/dashboard' && location.pathname.startsWith(path));
  };

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              to="/dashboard"
              className="flex items-center space-x-2 text-xl font-bold text-gray-900 hover:text-primary-600 transition-colors"
            >
              <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <svg 
                  className="h-5 w-5 text-white" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
              </div>
              <span className="hidden sm:block">Performance Evaluation</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="flex items-center space-x-4">
            <nav className="hidden md:flex space-x-1">
              {allowedMenuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${
                      isActivePath(item.path)
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* User Menu */}
            {state.user && (
              <div className="flex items-center space-x-4">
                {/* User Info */}
                <div className="hidden lg:flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {formatFullName(state.user.firstName, state.user.lastName)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {state.user.primaryRole}
                    </div>
                  </div>
                  {state.user.profilePicture ? (
                    <img
                      className="h-8 w-8 rounded-full"
                      src={state.user.profilePicture}
                      alt="Profile"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700">
                        {state.user.firstName[0]}{state.user.lastName[0]}
                      </span>
                    </div>
                  )}
                </div>

                {/* Profile Link */}
                <Link
                  to="/profile"
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-md transition-colors"
                  title="Profile"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </Link>

                {/* Logout Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="text-gray-700 border-gray-300 hover:bg-gray-50"
                >
                  <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-md transition-colors"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-2">
            <div className="space-y-1">
              {allowedMenuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`
                    block px-3 py-2 rounded-md text-base font-medium transition-colors
                    ${
                      isActivePath(item.path)
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  {item.label}
                </Link>
              ))}
              {state.user && (
                <>
                  <div className="px-3 py-2 border-t border-gray-200 mt-2 pt-2">
                    <div className="text-sm font-medium text-gray-900">
                      {formatFullName(state.user.firstName, state.user.lastName)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {state.user.primaryRole}
                    </div>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  >
                    Profile
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
