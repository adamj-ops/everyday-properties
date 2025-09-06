import { 
  MainLayout, 
  ContentLayout, 
  Dashboard, 
  PropertiesPage,
  Logo,
  GeometricCard,
  KPICard,
  MetricGrid
} from '@repo/design-system';
import { Building2, Users, DollarSign, TrendingUp } from 'lucide-react';

export default function DemoPage() {
  return (
    <MainLayout>
      <ContentLayout>
        <div className="space-y-8">
          {/* Logo Showcase */}
          <GeometricCard>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Logo Design System
            </h2>
            <div className="flex items-center space-x-8">
              <Logo variant="full" size="lg" />
              <Logo variant="icon" size="lg" />
              <Logo variant="text" size="lg" />
            </div>
          </GeometricCard>

          {/* KPI Cards Showcase */}
          <GeometricCard>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              KPI Cards
            </h2>
            <MetricGrid columns={4}>
              <KPICard
                title="Properties"
                value="12"
                change={{ value: "+2 this month", type: "positive" }}
                icon={Building2}
                description="Total properties managed"
              />
              <KPICard
                title="Units"
                value="48"
                change={{ value: "11 vacant", type: "neutral" }}
                icon={Users}
                description="Total units across all properties"
              />
              <KPICard
                title="Monthly Revenue"
                value="$45,000"
                change={{ value: "+12% growth", type: "positive" }}
                icon={DollarSign}
                description="Current month revenue"
              />
              <KPICard
                title="Occupancy Rate"
                value="94%"
                change={{ value: "+3% this month", type: "positive" }}
                icon={TrendingUp}
                description="Average occupancy across properties"
              />
            </MetricGrid>
          </GeometricCard>

          {/* Dashboard Preview */}
          <GeometricCard>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Dashboard Preview
            </h2>
            <div className="max-h-96 overflow-y-auto">
              <Dashboard />
            </div>
          </GeometricCard>

          {/* Properties Preview */}
          <GeometricCard>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Properties Management Preview
            </h2>
            <div className="max-h-96 overflow-y-auto">
              <PropertiesPage />
            </div>
          </GeometricCard>
        </div>
      </ContentLayout>
    </MainLayout>
  );
}
