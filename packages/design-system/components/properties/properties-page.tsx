import { 
  Search, 
  Filter, 
  Plus, 
  Building2,
  MapPin,
  Users,
  DollarSign
} from 'lucide-react';
import { PropertyCard, PropertiesList } from './property-card';
import { GeometricCard } from '../geometric-card';
import { PageHeader } from '../layout/header';

// Mock data for demonstration
const mockProperties = [
  {
    id: '1',
    name: 'Sunset Apartments',
    address: '123 Main Street, Anytown, CA 12345',
    unitCount: 12,
    occupiedUnits: 11,
    monthlyRevenue: 45000,
    occupancyRate: 92,
    photos: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=400&h=400&fit=crop',
    ]
  },
  {
    id: '2',
    name: 'Downtown Plaza',
    address: '456 Business Avenue, City, CA 90210',
    unitCount: 24,
    occupiedUnits: 21,
    monthlyRevenue: 78000,
    occupancyRate: 88,
    photos: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=400&h=400&fit=crop',
    ]
  },
  {
    id: '3',
    name: 'Garden View Complex',
    address: '789 Oak Street, Suburb, CA 54321',
    unitCount: 18,
    occupiedUnits: 16,
    monthlyRevenue: 54000,
    occupancyRate: 89,
    photos: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=400&fit=crop',
    ]
  }
];

export function PropertiesPage() {
  const handleView = (id: string) => {
    console.log('View property:', id);
  };

  const handleEdit = (id: string) => {
    console.log('Edit property:', id);
  };

  const handleDelete = (id: string) => {
    console.log('Delete property:', id);
  };

  const handleAddNew = () => {
    console.log('Add new property');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Properties"
        description="Manage your property portfolio"
        actions={
          <button
            onClick={handleAddNew}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </button>
        }
      />

      {/* Search and Filters */}
      <GeometricCard>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search properties by name, address, or unit count..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            />
          </div>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </button>
        </div>
      </GeometricCard>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GeometricCard className="text-center">
          <Building2 className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {mockProperties.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total Properties
          </div>
        </GeometricCard>
        
        <GeometricCard className="text-center">
          <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {mockProperties.reduce((sum, p) => sum + p.unitCount, 0)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total Units
          </div>
        </GeometricCard>
        
        <GeometricCard className="text-center">
          <DollarSign className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            ${mockProperties.reduce((sum, p) => sum + p.monthlyRevenue, 0).toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Monthly Revenue
          </div>
        </GeometricCard>
        
        <GeometricCard className="text-center">
          <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {Math.round(mockProperties.reduce((sum, p) => sum + p.occupancyRate, 0) / mockProperties.length)}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Avg Occupancy
          </div>
        </GeometricCard>
      </div>

      {/* Properties List */}
      <PropertiesList
        properties={mockProperties}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
