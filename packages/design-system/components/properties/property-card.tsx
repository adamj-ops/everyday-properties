import { cn } from '../../lib/utils';
import { type ReactNode } from 'react';
import { 
  MapPin, 
  Users, 
  DollarSign, 
  TrendingUp,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { GeometricCard, PhotoGrid, PhotoGridItem } from '../geometric-card';

interface PropertyCardProps {
  property: {
    id: string;
    name: string;
    address: string;
    unitCount: number;
    occupiedUnits: number;
    monthlyRevenue: number;
    occupancyRate: number;
    photos?: string[];
  };
  className?: string;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function PropertyCard({ 
  property, 
  className, 
  onView, 
  onEdit, 
  onDelete 
}: PropertyCardProps) {
  const { 
    id, 
    name, 
    address, 
    unitCount, 
    occupiedUnits, 
    monthlyRevenue, 
    occupancyRate,
    photos = []
  } = property;

  return (
    <GeometricCard className={cn('hover:shadow-lg transition-all duration-200', className)}>
      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="mb-4">
          <PhotoGrid columns={3}>
            {photos.slice(0, 6).map((photo, index) => (
              <PhotoGridItem key={index} aspectRatio="square">
                <img
                  src={photo}
                  alt={`${name} photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </PhotoGridItem>
            ))}
          </PhotoGrid>
        </div>
      )}

      {/* Property Info */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {name}
          </h3>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-1">
            <MapPin className="h-4 w-4 mr-1" />
            {address}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
            <div className="flex items-center justify-center mb-1">
              <Users className="h-4 w-4 text-gray-400 mr-1" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Units
              </span>
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {unitCount}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500">
              {occupiedUnits} occupied
            </div>
          </div>

          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
            <div className="flex items-center justify-center mb-1">
              <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Revenue
              </span>
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              ${monthlyRevenue.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500">
              per month
            </div>
          </div>
        </div>

        {/* Occupancy Rate */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
          <div className="flex items-center">
            <TrendingUp className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Occupancy Rate
            </span>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {occupancyRate}%
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500">
              {unitCount - occupiedUnits} vacant
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex space-x-2">
            <button
              onClick={() => onView?.(id)}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Eye className="h-4 w-4 mr-1 inline" />
              View
            </button>
            <button
              onClick={() => onEdit?.(id)}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Edit className="h-4 w-4 mr-1 inline" />
              Edit
            </button>
          </div>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onDelete?.(id)}
              className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </GeometricCard>
  );
}

interface PropertiesListProps {
  properties: Array<PropertyCardProps['property']>;
  className?: string;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function PropertiesList({ 
  properties, 
  className, 
  onView, 
  onEdit, 
  onDelete 
}: PropertiesListProps) {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6', className)}>
      {properties.map((property) => (
        <PropertyCard
          key={property.id}
          property={property}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
