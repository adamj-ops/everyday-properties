import { auth } from '@repo/auth/server';
import { database } from '@repo/database';
import { Button } from '@repo/design-system/components/ui/button';
import { Badge } from '@repo/design-system/components/ui/badge';
import { 
  ArrowLeft, 
  Building2, 
  MapPin, 
  Plus,
  Home,
  Users,
  Edit,
  DollarSign
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { orgId } = await auth();
  
  if (!orgId) {
    return { title: 'Property Not Found' };
  }

  const property = await database.property.findFirst({
    where: { id: params.id, orgId },
    select: { name: true }
  });

  return {
    title: property ? `${property.name} - Everyday Properties` : 'Property Not Found',
    description: property ? `Manage ${property.name} and its units` : 'Property not found',
  };
}

const PropertyDetailsPage = async ({ params }: Props) => {
  const { orgId } = await auth();

  if (!orgId) {
    notFound();
  }

  // Fetch property with units and leases
  const property = await database.property.findFirst({
    where: { id: params.id, orgId },
    include: {
      units: {
        include: {
          leases: {
            where: { status: 'active' },
            select: { id: true, rent: true, primaryResident: { select: { fullName: true, email: true } } }
          }
        },
        orderBy: { unitNumber: 'asc' }
      }
    }
  });

  if (!property) {
    notFound();
  }

  // Calculate metrics
  const totalUnits = property.units.length;
  const occupiedUnits = property.units.filter(u => u.status === 'occupied').length;
  const vacantUnits = property.units.filter(u => u.status === 'vacant').length;
  const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
  
  const totalRevenue = property.units.reduce((total, unit) => {
    const activeLease = unit.leases[0];
    return total + (activeLease ? Number(activeLease.rent) : 0);
  }, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'occupied': return 'bg-green-100 text-green-800';
      case 'vacant': return 'bg-orange-100 text-orange-800';
      case 'make_ready': return 'bg-blue-100 text-blue-800';
      case 'maintenance_hold': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/properties">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight">{property.name}</h1>
            {(property.addressLine1 || property.city) && (
              <div className="flex items-center text-muted-foreground">
                <MapPin className="mr-1 h-4 w-4" />
                <span>
                  {property.addressLine1}
                  {property.city && property.addressLine1 && ', '}
                  {property.city}
                  {property.state && `, ${property.state} ${property.postalCode}`}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/properties/${property.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Property
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/properties/${property.id}/units/new`}>
              <Plus className="mr-2 h-4 w-4" />
              Add Unit
            </Link>
          </Button>
        </div>
      </div>

      {/* Property Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Total Units</p>
              <p className="text-2xl font-bold">{totalUnits}</p>
            </div>
            <Home className="h-6 w-6 text-muted-foreground" />
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Occupancy Rate</p>
              <p className="text-2xl font-bold">{occupancyRate}%</p>
            </div>
            <Users className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {occupiedUnits} occupied, {vacantUnits} vacant
          </p>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
              <p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
            </div>
            <DollarSign className="h-6 w-6 text-muted-foreground" />
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Avg. Rent</p>
              <p className="text-2xl font-bold">
                ${occupiedUnits > 0 ? Math.round(totalRevenue / occupiedUnits).toLocaleString() : '0'}
              </p>
            </div>
            <Building2 className="h-6 w-6 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Property Description */}
      {property.notes && (
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold mb-2">Description</h2>
          <p className="text-muted-foreground">{property.notes}</p>
        </div>
      )}

      {/* Units List */}
      <div className="rounded-lg border bg-card">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Units</h2>
            <Button size="sm" asChild>
              <Link href={`/properties/${property.id}/units/new`}>
                <Plus className="mr-2 h-4 w-4" />
                Add Unit
              </Link>
            </Button>
          </div>
        </div>

        {totalUnits > 0 ? (
          <div className="divide-y">
            {property.units.map((unit) => {
              const activeLease = unit.leases[0];
              return (
                <div key={unit.id} className="p-6 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">Unit {unit.unitNumber}</h3>
                          <Badge className={getStatusColor(unit.status)}>
                            {formatStatus(unit.status)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {unit.bedrooms && (
                            <span>{unit.bedrooms} bed</span>
                          )}
                          {unit.bathrooms && (
                            <span>{unit.bathrooms} bath</span>
                          )}
                          {unit.sqft && (
                            <span>{unit.sqft} sq ft</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      {activeLease ? (
                        <div className="text-right">
                          <p className="font-medium">${Number(activeLease.rent).toLocaleString()}/mo</p>
                          <p className="text-sm text-muted-foreground">
                            {activeLease.primaryResident?.fullName || 'Unknown Tenant'}
                          </p>
                        </div>
                      ) : (
                        <div className="text-right">
                          <p className="font-medium">${Number(unit.marketRent).toLocaleString()}/mo</p>
                          <p className="text-sm text-muted-foreground">Market rate</p>
                        </div>
                      )}
                      
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/units/${unit.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center">
            <Home className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">No units yet</h3>
            <p className="text-muted-foreground mb-4">
              Add units to this property to start managing tenants and leases.
            </p>
            <Button asChild>
              <Link href={`/properties/${property.id}/units/new`}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Unit
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyDetailsPage;
