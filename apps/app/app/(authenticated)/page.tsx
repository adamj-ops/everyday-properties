import { auth } from '@repo/auth/server';
import { database } from '@repo/database';
import { Dashboard } from '@repo/design-system/components/dashboard/dashboard';
import { 
  Building2, 
  Users, 
  DollarSign, 
  TrendingUp 
} from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

const title = 'Property Management Dashboard - Everyday Properties';
const description = 'Manage your properties, units, and tenants efficiently.';

export const metadata: Metadata = {
  title,
  description,
};

const App = async () => {
  const { orgId } = await auth();

  if (!orgId) {
    notFound();
  }

  // Fetch dashboard metrics
  const [properties, units, leases] = await Promise.all([
    database.property.findMany({
      where: { orgId },
      include: {
        units: {
          select: { id: true, status: true, marketRent: true }
        }
      }
    }),
    database.unit.findMany({
      where: { orgId },
      select: { id: true, status: true, marketRent: true }
    }),
    database.lease.findMany({
      where: { orgId, status: 'active' },
      select: { id: true, rent: true }
    })
  ]);

  // Calculate metrics
  const totalProperties = properties.length;
  const totalUnits = units.length;
  const occupiedUnits = units.filter(unit => unit.status === 'occupied').length;
  const vacantUnits = units.filter(unit => unit.status === 'vacant').length;
  const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
  
  // Calculate monthly revenue from active leases
  const monthlyRevenue = leases.reduce((total, lease) => {
    return total + Number(lease.rent);
  }, 0);

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your property management operations
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Properties</p>
              <p className="text-2xl font-bold">{totalProperties}</p>
            </div>
            <Building2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Total properties managed
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Units</p>
              <p className="text-2xl font-bold">{totalUnits}</p>
            </div>
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {vacantUnits} vacant units
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
              <p className="text-2xl font-bold">${monthlyRevenue.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            From active leases
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Occupancy Rate</p>
              <p className="text-2xl font-bold">{occupancyRate}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {occupiedUnits} of {totalUnits} units occupied
          </p>
        </div>
      </div>

      {/* Properties Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {properties.map((property) => (
          <div key={property.id} className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
            <div className="space-y-2">
              <h3 className="font-semibold">{property.name}</h3>
              <p className="text-sm text-muted-foreground">
                {property.addressLine1}
                {property.city && `, ${property.city}`}
                {property.state && `, ${property.state}`}
              </p>
              <div className="flex items-center justify-between text-sm">
                <span>{property.units.length} units</span>
                <span className="text-muted-foreground">
                  {property.units.filter(u => u.status === 'occupied').length} occupied
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalProperties === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No properties yet</h3>
          <p className="text-muted-foreground mb-4">
            Get started by adding your first property to the system.
          </p>
        </div>
      )}
    </div>
  );
};

export default App;
