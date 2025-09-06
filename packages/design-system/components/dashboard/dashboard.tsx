import { 
  Building2, 
  Users, 
  DollarSign, 
  TrendingUp,
  Wrench,
  CreditCard,
  FileText,
  AlertCircle
} from 'lucide-react';
import { KPICard, MetricGrid, ActivityFeed, ActivityItem } from '../kpi-card';
import { GeometricCard } from '../geometric-card';

export function Dashboard() {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
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

      {/* Secondary Metrics */}
      <MetricGrid columns={4}>
        <KPICard
          title="Open Work Orders"
          value="3"
          change={{ value: "1 high priority", type: "warning" }}
          icon={Wrench}
          description="Maintenance requests pending"
        />
        <KPICard
          title="Payments On Time"
          value="47"
          change={{ value: "1 overdue", type: "negative" }}
          icon={CreditCard}
          description="Payments received this month"
        />
        <KPICard
          title="Active Leases"
          value="11"
          change={{ value: "1 expiring soon", type: "warning" }}
          icon={FileText}
          description="Current lease agreements"
        />
        <KPICard
          title="Revenue Growth"
          value="+15%"
          change={{ value: "+2 properties", type: "positive" }}
          icon={TrendingUp}
          description="Year-over-year growth"
        />
      </MetricGrid>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <GeometricCard>
            <ActivityFeed title="Recent Activity">
              <ActivityItem
                title="New lease signed"
                description="Unit 2B - Sunset Apartments"
                timestamp="2 hours ago"
                icon={FileText}
                type="success"
              />
              <ActivityItem
                title="Payment received"
                description="$2,500 from John Smith"
                timestamp="4 hours ago"
                icon={CreditCard}
                type="success"
              />
              <ActivityItem
                title="Work order completed"
                description="Kitchen repair - Unit 3A"
                timestamp="1 day ago"
                icon={Wrench}
                type="success"
              />
              <ActivityItem
                title="Maintenance request"
                description="Plumbing issue - Unit 1C"
                timestamp="2 days ago"
                icon={AlertCircle}
                type="warning"
              />
            </ActivityFeed>
          </GeometricCard>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <GeometricCard>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button className="w-full text-left p-3 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex items-center space-x-3">
                  <Building2 className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium">Add New Property</span>
                </div>
              </button>
              <button className="w-full text-left p-3 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium">Create New Lease</span>
                </div>
              </button>
              <button className="w-full text-left p-3 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex items-center space-x-3">
                  <Wrench className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium">Submit Work Order</span>
                </div>
              </button>
              <button className="w-full text-left p-3 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium">Process Payment</span>
                </div>
              </button>
            </div>
          </GeometricCard>

          {/* Alerts */}
          <GeometricCard>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Alerts & Reminders
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Lease expires in 30 days
                  </span>
                </div>
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                  Unit 2B - John Smith
                </p>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <span className="text-sm font-medium text-red-800 dark:text-red-200">
                    Payment overdue
                  </span>
                </div>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  Unit 3A - Sarah Johnson
                </p>
              </div>
            </div>
          </GeometricCard>
        </div>
      </div>
    </div>
  );
}
