import { AnalyticsProvider } from '@repo/analytics';
import { AuthProvider } from '@repo/auth/provider';
import type { ThemeProviderProps } from 'next-themes';
import { Toaster } from './components/ui/sonner';
import { TooltipProvider } from './components/ui/tooltip';
import { ThemeProvider } from './providers/theme';

// Export all our new components
export { Logo } from './components/logo';
export { GeometricCard, GeometricFrame, PhotoGrid, PhotoGridItem } from './components/geometric-card';
export { KPICard, MetricGrid, ActivityItem, ActivityFeed } from './components/kpi-card';
export { Sidebar } from './components/layout/sidebar';
export { Header, PageHeader } from './components/layout/header';
export { MainLayout, ContentLayout, GridLayout } from './components/layout/main-layout';
export { Dashboard } from './components/dashboard/dashboard';
export { PropertyCard, PropertiesList } from './components/properties/property-card';
export { PropertiesPage } from './components/properties/properties-page';

// Export theme
export { theme } from './lib/theme';

type DesignSystemProviderProperties = ThemeProviderProps & {
  privacyUrl?: string;
  termsUrl?: string;
  helpUrl?: string;
};

export const DesignSystemProvider = ({
  children,
  privacyUrl,
  termsUrl,
  helpUrl,
  ...properties
}: DesignSystemProviderProperties) => (
  <ThemeProvider {...properties}>
    <AuthProvider privacyUrl={privacyUrl} termsUrl={termsUrl} helpUrl={helpUrl}>
      <AnalyticsProvider>
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster />
      </AnalyticsProvider>
    </AuthProvider>
  </ThemeProvider>
);