'use client';

import { cn } from '../../lib/utils';
import { Logo } from '../logo';
import { type ReactNode } from 'react';
import { 
  Home, 
  Building2, 
  Users, 
  FileText, 
  Wrench, 
  CreditCard, 
  BarChart3, 
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  className?: string;
  collapsed?: boolean;
  onToggle?: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  active?: boolean;
}

const navigationItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: Home },
  { label: 'Properties', href: '/properties', icon: Building2, badge: 12 },
  { label: 'Units', href: '/units', icon: Users, badge: 48 },
  { label: 'Leases', href: '/leases', icon: FileText, badge: 11 },
  { label: 'Work Orders', href: '/work-orders', icon: Wrench, badge: 3 },
  { label: 'Payments', href: '/payments', icon: CreditCard },
  { label: 'Reports', href: '/reports', icon: BarChart3 },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar({ className, collapsed = false, onToggle }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
    onToggle?.();
  };

  return (
    <div
      className={cn(
        'flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700',
        'transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      {/* Header with Logo */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        {!isCollapsed && (
          <Logo variant="full" size="md" />
        )}
        {isCollapsed && (
          <Logo variant="icon" size="md" />
        )}
        <button
          onClick={handleToggle}
          className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => (
          <NavItem key={item.href} item={item} collapsed={isCollapsed} />
        ))}
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <UserProfile collapsed={isCollapsed} />
      </div>
    </div>
  );
}

interface NavItemProps {
  item: NavItem;
  collapsed: boolean;
}

function NavItem({ item, collapsed }: NavItemProps) {
  const { label, href, icon: Icon, badge, active } = item;

  return (
    <a
      href={href}
      className={cn(
        'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
        'hover:bg-gray-100 dark:hover:bg-gray-800',
        active 
          ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' 
          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white',
        collapsed ? 'justify-center' : 'justify-start'
      )}
    >
      <Icon className={cn('h-5 w-5', collapsed ? '' : 'mr-3')} />
      {!collapsed && (
        <>
          <span className="flex-1">{label}</span>
          {badge && (
            <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
              {badge}
            </span>
          )}
        </>
      )}
    </a>
  );
}

interface UserProfileProps {
  collapsed: boolean;
}

function UserProfile({ collapsed }: UserProfileProps) {
  return (
    <div className={cn('flex items-center', collapsed ? 'justify-center' : 'space-x-3')}>
      <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
          JD
        </span>
      </div>
      {!collapsed && (
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
            John Doe
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            Property Manager
          </p>
        </div>
      )}
    </div>
  );
}
