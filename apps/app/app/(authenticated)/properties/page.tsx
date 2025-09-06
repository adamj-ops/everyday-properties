import { auth } from '@repo/auth/server';
import { database } from '@repo/database';
import { Button } from '@repo/design-system/components/ui/button';
import { 
  Building2, 
  Plus,
  MapPin,
  Users,
  Home
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Properties - Everyday Properties',
  description: 'Manage your properties and view detailed information.',
};

const PropertiesPage = async () => {
  const { orgId } = await auth();

  if (!orgId) {
    notFound();
  }

  // Fetch properties with unit information
  const properties = await database.property.findMany({
    where: { orgId },
    include: {
      units: {
        select: { id: true, status: true, marketRent: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Properties</h1>
          <p className="text-muted-foreground">
            Manage your properties and view detailed information
          </p>
        </div>
        <Button asChild>
          <Link href="/properties/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Property
          </Link>
        </Button>
      </div>

      {/* Properties Grid */}
      {properties.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => {
            const totalUnits = property.units.length;
            const occupiedUnits = property.units.filter(u => u.status === 'occupied').length;
            const vacantUnits = property.units.filter(u => u.status === 'vacant').length;
            const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
            
            return (
              <Link 
                key={property.id} 
                href={`/properties/${property.id}`}
                className="block group"
              >
                <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm transition-shadow hover:shadow-md">
                  <div className="space-y-4">
                    {/* Property Header */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                          {property.name}
                        </h3>
                        {(property.addressLine1 || property.city) && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="mr-1 h-3 w-3" />
                            <span>
                              {property.addressLine1}
                              {property.city && property.addressLine1 && ', '}
                              {property.city}
                              {property.state && `, ${property.state}`}
                            </span>
                          </div>
                        )}
                      </div>
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                    </div>

                    {/* Property Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Home className="mr-1 h-3 w-3" />
                          <span>Total Units</span>
                        </div>
                        <p className="text-xl font-semibold">{totalUnits}</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Users className="mr-1 h-3 w-3" />
                          <span>Occupancy</span>
                        </div>
                        <p className="text-xl font-semibold">{occupancyRate}%</p>
                      </div>
                    </div>

                    {/* Unit Status */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-green-600 font-medium">
                        {occupiedUnits} occupied
                      </span>
                      <span className="text-orange-600 font-medium">
                        {vacantUnits} vacant
                      </span>
                    </div>

                    {/* Property Notes */}
                    {property.notes && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {property.notes}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No properties yet</h3>
          <p className="text-muted-foreground mb-6 max-w-sm">
            Get started by adding your first property to the system. You can manage units, 
            tenants, and track occupancy rates.
          </p>
          <Button asChild>
            <Link href="/properties/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Property
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default PropertiesPage;
