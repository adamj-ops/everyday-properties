import { cn } from '../lib/utils';
import { type ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: {
    value: string | number;
    type: 'positive' | 'negative' | 'neutral';
  };
  icon?: LucideIcon;
  description?: string;
  className?: string;
}

export function KPICard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  description,
  className 
}: KPICardProps) {
  const changeColors = {
    positive: 'text-green-600 dark:text-green-400',
    negative: 'text-red-600 dark:text-red-400',
    neutral: 'text-gray-600 dark:text-gray-400',
  };

  const changeIcons = {
    positive: '↗',
    negative: '↘',
    neutral: '→',
  };

  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6',
        'hover:shadow-md transition-all duration-200',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <div className="mt-2 flex items-baseline">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {value}
            </p>
            {change && (
              <span
                className={cn(
                  'ml-2 text-sm font-medium',
                  changeColors[change.type]
                )}
              >
                {changeIcons[change.type]} {change.value}
              </span>
            )}
          </div>
          {description && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
              {description}
            </p>
          )}
        </div>
        {Icon && (
          <div className="ml-4 flex-shrink-0">
            <Icon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
          </div>
        )}
      </div>
    </div>
  );
}

interface MetricGridProps {
  children: ReactNode;
  className?: string;
  columns?: 2 | 3 | 4;
}

export function MetricGrid({ 
  children, 
  className, 
  columns = 4 
}: MetricGridProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  };

  return (
    <div
      className={cn(
        'grid gap-6',
        gridCols[columns],
        'max-md:grid-cols-2 max-sm:grid-cols-1',
        className
      )}
    >
      {children}
    </div>
  );
}

interface ActivityItemProps {
  title: string;
  description: string;
  timestamp: string;
  icon?: LucideIcon;
  type?: 'success' | 'warning' | 'info' | 'error';
  className?: string;
}

export function ActivityItem({ 
  title, 
  description, 
  timestamp, 
  icon: Icon,
  type = 'info',
  className 
}: ActivityItemProps) {
  const typeColors = {
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    info: 'text-blue-600 dark:text-blue-400',
    error: 'text-red-600 dark:text-red-400',
  };

  return (
    <div
      className={cn(
        'flex items-start space-x-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg',
        'hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
        className
      )}
    >
      {Icon && (
        <div className={cn('flex-shrink-0', typeColors[type])}>
          <Icon className="h-5 w-5" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {title}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          {timestamp}
        </p>
      </div>
    </div>
  );
}

interface ActivityFeedProps {
  children: ReactNode;
  title?: string;
  className?: string;
}

export function ActivityFeed({ 
  children, 
  title = 'Recent Activity',
  className 
}: ActivityFeedProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
}
