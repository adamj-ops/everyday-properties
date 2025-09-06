import { cn } from '../lib/utils';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'icon' | 'text';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Logo({ className, variant = 'full', size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl', 
    xl: 'text-3xl'
  };

  const Icon = () => (
    <svg
      viewBox="0 0 32 32"
      className={cn(sizeClasses[size], className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Incomplete frame - top and left sides */}
      <path
        d="M4 4H28M4 4V28M28 4V8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* House silhouette integrated into frame */}
      <path
        d="M8 8H24M8 8V24M24 8V24M8 24H24"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* House roof */}
      <path
        d="M8 8L16 4L24 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  if (variant === 'icon') {
    return <Icon />;
  }

  if (variant === 'text') {
    return (
      <span className={cn('font-bold text-gray-900 dark:text-white', textSizeClasses[size], className)}>
        Everyday Properties
      </span>
    );
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Icon />
      <span className={cn('font-bold text-gray-900 dark:text-white', textSizeClasses[size])}>
        Everyday Properties
      </span>
    </div>
  );
}
