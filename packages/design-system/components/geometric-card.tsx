import { cn } from '../lib/utils';
import { type ReactNode } from 'react';

interface GeometricCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'outlined' | 'elevated';
  size?: 'sm' | 'md' | 'lg';
}

export function GeometricCard({ 
  children, 
  className, 
  variant = 'default',
  size = 'md' 
}: GeometricCardProps) {
  const variants = {
    default: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700',
    outlined: 'bg-transparent border-2 border-gray-300 dark:border-gray-600',
    elevated: 'bg-white dark:bg-gray-900 shadow-lg border border-gray-200 dark:border-gray-700',
  };

  const sizes = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={cn(
        'rounded-lg transition-all duration-200',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </div>
  );
}

interface GeometricFrameProps {
  children: ReactNode;
  className?: string;
  variant?: 'full' | 'partial' | 'minimal';
}

export function GeometricFrame({ 
  children, 
  className, 
  variant = 'full' 
}: GeometricFrameProps) {
  const variants = {
    full: 'border-2 border-gray-300 dark:border-gray-600',
    partial: 'border-l-4 border-t-4 border-gray-300 dark:border-gray-600',
    minimal: 'border-l-2 border-t-2 border-gray-200 dark:border-gray-700',
  };

  return (
    <div
      className={cn(
        'relative',
        variants[variant],
        className
      )}
    >
      {children}
    </div>
  );
}

interface PhotoGridProps {
  children: ReactNode;
  className?: string;
  columns?: 2 | 3 | 4 | 6;
}

export function PhotoGrid({ 
  children, 
  className, 
  columns = 3 
}: PhotoGridProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    6: 'grid-cols-6',
  };

  return (
    <div
      className={cn(
        'grid gap-1',
        gridCols[columns],
        className
      )}
    >
      {children}
    </div>
  );
}

interface PhotoGridItemProps {
  children: ReactNode;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'wide';
}

export function PhotoGridItem({ 
  children, 
  className, 
  aspectRatio = 'square' 
}: PhotoGridItemProps) {
  const aspectRatios = {
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[4/3]',
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md border border-gray-200 dark:border-gray-700',
        aspectRatios[aspectRatio],
        className
      )}
    >
      {children}
    </div>
  );
}
