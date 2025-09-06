import { auth } from '@repo/auth/server';
import { database } from '@repo/database';
import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';
import { Label } from '@repo/design-system/components/ui/label';
import { Textarea } from '@repo/design-system/components/ui/textarea';
import { ArrowLeft, Building2 } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Add Property - Everyday Properties',
  description: 'Add a new property to your portfolio.',
};

async function createProperty(formData: FormData) {
  'use server';
  
  const { orgId } = await auth();
  
  if (!orgId) {
    throw new Error('Not authenticated');
  }

  const name = formData.get('name') as string;
  const addressLine1 = formData.get('addressLine1') as string;
  const addressLine2 = formData.get('addressLine2') as string;
  const city = formData.get('city') as string;
  const state = formData.get('state') as string;
  const postalCode = formData.get('postalCode') as string;
  const country = formData.get('country') as string;
  const notes = formData.get('notes') as string;

  // Basic validation
  if (!name || !addressLine1 || !city || !state || !postalCode) {
    throw new Error('Required fields are missing');
  }

  try {
    const property = await database.property.create({
      data: {
        orgId,
        name,
        addressLine1,
        addressLine2: addressLine2 || null,
        city,
        state,
        postalCode,
        country: country || 'USA',
        notes: notes || null,
      },
    });

    redirect(`/properties/${property.id}`);
  } catch (error) {
    console.error('Error creating property:', error);
    throw new Error('Failed to create property');
  }
}

const NewPropertyPage = async () => {
  const { orgId } = await auth();

  if (!orgId) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/properties">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">Add Property</h1>
          <p className="text-muted-foreground">
            Add a new property to your portfolio
          </p>
        </div>
      </div>

      {/* Property Form */}
      <div className="max-w-2xl">
        <form action={createProperty} className="space-y-6">
          {/* Property Information */}
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Property Information</h2>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Property Name *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., Sunset Apartments, Oak Street Complex"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Description</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Brief description of the property..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Address</h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="addressLine1">Street Address *</Label>
                <Input
                  id="addressLine1"
                  name="addressLine1"
                  placeholder="123 Main Street"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="addressLine2">Address Line 2</Label>
                <Input
                  id="addressLine2"
                  name="addressLine2"
                  placeholder="Apartment, suite, unit, building, floor, etc."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    name="city"
                    placeholder="San Francisco"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    name="state"
                    placeholder="CA"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="postalCode">ZIP Code *</Label>
                  <Input
                    id="postalCode"
                    name="postalCode"
                    placeholder="94102"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    name="country"
                    placeholder="USA"
                    defaultValue="USA"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center gap-4">
            <Button type="submit">
              Create Property
            </Button>
            <Button variant="outline" asChild>
              <Link href="/properties">
                Cancel
              </Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewPropertyPage;
