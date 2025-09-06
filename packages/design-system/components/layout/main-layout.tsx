'use client';

import { cn } from '../../lib/utils';
import { type ReactNode } from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { useState } from 'react';

interface MainLayoutProps {
  children: ReactNode;
  className?: string;
}

export function MainLayout({ children, className }: MainLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className={cn(
        'hidden lg:flex',
        mobileMenuOpen ? 'lg:flex' : 'lg:flex'
      )}>
        <Sidebar 
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex w-64 h-full">
            <Sidebar 
              collapsed={false}
              onToggle={() => setMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          showMenuButton={true}
        />
        
        <main className={cn(
          'flex-1 overflow-auto',
          className
        )}>
          {children}
        </main>
      </div>
    </div>
  );
}

interface ContentLayoutProps {
  children: ReactNode;
  className?: string;
}

export function ContentLayout({ children, className }: ContentLayoutProps) {
  return (
    <div className={cn('p-6 space-y-6', className)}>
      {children}
    </div>
  );
}

interface GridLayoutProps {
  children: ReactNode;
  className?: string;
  columns?: 1 | 2 | 3 | 4;
}

export function GridLayout({ 
  children, 
  className, 
  columns = 1 
}: GridLayoutProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 lg:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  return (
    <div className={cn(
      'grid gap-6',
      gridCols[columns],
      className
    )}>
      {children}
    </div>
  );
}
