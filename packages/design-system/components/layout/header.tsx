'use client';

import { cn } from '../../lib/utils';
import { type ReactNode } from 'react';
import { 
  Search, 
  Bell, 
  Settings, 
  User,
  Menu,
  Sun,
  Moon
} from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  className?: string;
  onMenuToggle?: () => void;
  showMenuButton?: boolean;
}

export function Header({ 
  className, 
  onMenuToggle, 
  showMenuButton = false 
}: HeaderProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // TODO: Implement theme toggle logic
  };

  return (
    <header
      className={cn(
        'flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700',
        'sticky top-0 z-50',
        className
      )}
    >
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        {showMenuButton && (
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors lg:hidden"
          >
            <Menu className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
        )}
        
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search properties, units, residents..."
            className="pl-10 pr-4 py-2 w-80 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {isDarkMode ? (
            <Sun className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          ) : (
            <Moon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          )}
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            3
          </span>
        </button>

        {/* Settings */}
        <button className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>

        {/* User Menu */}
        <div className="relative">
          <button className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
              <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                John Doe
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Property Manager
              </p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ 
  title, 
  description, 
  actions, 
  className 
}: PageHeaderProps) {
  return (
    <div className={cn('px-6 py-4 border-b border-gray-200 dark:border-gray-700', className)}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center space-x-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
