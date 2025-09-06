# Phase 1 Technical Specification - Core Property Management

## Overview
Phase 1 focuses on implementing the core property management functionality that enables property managers to manage their properties, units, users, and basic lease operations within a multi-tenant environment.

## Prerequisites
- Phase 0 must be completed (environment setup, database, authentication)
- All Phase 0 tests must pass
- Database seeded with test data

## Architecture Decisions

### Component Strategy
- Leverage existing components in `packages/design-system/components/`
- Follow Next.js App Router patterns
- Implement server components where possible for better performance
- Use React Server Actions for form submissions

### Data Access Patterns
- All database operations must include `orgId` filtering for multi-tenancy
- Use Prisma client with proper type safety
- Implement consistent error handling and validation
- Follow the repository pattern for complex queries

### UI/UX Principles
- Mobile-first responsive design
- Consistent with existing design system
- Loading states for all async operations
- Proper error messaging and validation feedback
- Accessible components following WCAG guidelines

## Feature Specifications

### 1. Property Management Dashboard

**Location**: `apps/app/app/(authenticated)/page.tsx`

**Requirements**:
- Display KPI cards: Total Properties, Total Units, Monthly Revenue, Occupancy Rate
- Real-time metrics calculated from database
- Quick action buttons for common tasks
- Recent activity feed
- Responsive grid layout

**Components to Use**:
- `KPICard` from `packages/design-system/components/kpi-card`
- `Dashboard` from `packages/design-system/components/dashboard/dashboard.tsx`

**Database Queries**:
```typescript
// Property count
const propertyCount = await db.property.count({ where: { orgId } });

// Unit metrics
const units = await db.unit.findMany({ 
  where: { orgId },
  select: { status: true, marketRent: true }
});

// Occupancy calculation
const occupiedUnits = units.filter(u => u.status === 'occupied').length;
const occupancyRate = (occupiedUnits / units.length) * 100;
```

### 2. Properties Management

**Location**: `apps/app/app/(authenticated)/properties/`

**Pages Required**:
- `page.tsx` - Properties listing
- `new/page.tsx` - Add new property form
- `[id]/page.tsx` - Property details view
- `[id]/edit/page.tsx` - Edit property form

**Requirements**:
- Paginated properties list with search/filter
- Add/edit/delete operations with proper validation
- Property details with units overview
- Address validation and formatting
- Bulk operations support

**Components to Use**:
- `PropertiesPage` from `packages/design-system/components/properties/properties-page.tsx`
- `Button`, `Input`, `Form` from design system
- `DataTable` for listings

**Database Operations**:
```typescript
// Create property
const property = await db.property.create({
  data: {
    orgId,
    name,
    addressLine1,
    city,
    state,
    postalCode,
    country
  }
});

// List properties with units
const properties = await db.property.findMany({
  where: { orgId },
  include: {
    units: {
      select: { id: true, status: true }
    }
  },
  orderBy: { createdAt: 'desc' }
});
```

### 3. Units Management

**Location**: `apps/app/app/(authenticated)/properties/[propertyId]/units/`

**Pages Required**:
- `page.tsx` - Units listing for property
- `new/page.tsx` - Add new unit form
- `[unitId]/page.tsx` - Unit details view
- `[unitId]/edit/page.tsx` - Edit unit form

**Requirements**:
- Units grid/list view with status indicators
- Unit status management (vacant, occupied, make_ready, maintenance_hold)
- Market rent setting and tracking
- Amenities management (JSON field)
- Unit availability calendar

**Key Features**:
- Status change workflows with validation
- Rent history tracking
- Unit photos and documents
- Maintenance history integration

**Database Operations**:
```typescript
// Create unit
const unit = await db.unit.create({
  data: {
    orgId,
    propertyId,
    unitNumber,
    bedrooms,
    bathrooms,
    sqft,
    marketRent,
    status: 'vacant',
    amenities: JSON.stringify(amenitiesList)
  }
});

// Update unit status
const updatedUnit = await db.unit.update({
  where: { id: unitId, orgId },
  data: { status: newStatus }
});
```

### 4. User Management System

**Location**: `apps/app/app/(authenticated)/users/`

**Pages Required**:
- `page.tsx` - Users listing
- `invite/page.tsx` - Invite new user form
- `[userId]/page.tsx` - User profile view
- `[userId]/edit/page.tsx` - Edit user profile

**Requirements**:
- Role-based user listing (admin, manager, leasing, maintenance, resident)
- User invitation system with email notifications
- Role assignment and permission management
- User profile management
- Deactivation/reactivation workflows

**Role Permissions**:
- **Admin**: Full system access
- **Manager**: Property and user management
- **Leasing**: Lease and resident management
- **Maintenance**: Work order management
- **Resident**: Limited self-service access

### 5. Basic Lease Management

**Location**: `apps/app/app/(authenticated)/leases/`

**Pages Required**:
- `page.tsx` - Leases listing
- `new/page.tsx` - Create new lease form
- `[leaseId]/page.tsx` - Lease details view
- `[leaseId]/edit/page.tsx` - Edit lease form

**Requirements**:
- Lease creation with unit and resident assignment
- Lease status management (draft, active, pending, terminated, renewed)
- Lease participant management
- Document upload and storage
- Lease renewal workflows

**Database Operations**:
```typescript
// Create lease
const lease = await db.lease.create({
  data: {
    orgId,
    unitId,
    primaryResidentId,
    startDate,
    endDate,
    rent,
    deposit,
    status: 'draft'
  }
});

// Add lease participant
const participant = await db.leaseParticipant.create({
  data: {
    orgId,
    leaseId,
    userProfileId,
    role: 'resident'
  }
});
```

## Technical Implementation Details

### Authentication & Authorization

**Middleware Setup**:
```typescript
// middleware.ts
export default clerkMiddleware((auth, req) => {
  // Protect authenticated routes
  if (req.nextUrl.pathname.startsWith('/authenticated')) {
    auth().protect();
  }
});
```

**User Profile Integration**:
```typescript
// Get user profile with org context
async function getUserProfile(clerkUserId: string) {
  return await db.userProfile.findUnique({
    where: { clerkUserId },
    include: { org: true }
  });
}
```

### Data Validation

**Zod Schemas**:
```typescript
const PropertySchema = z.object({
  name: z.string().min(1, "Property name is required"),
  addressLine1: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(2, "State is required"),
  postalCode: z.string().min(5, "Valid postal code required")
});
```

### Error Handling

**Consistent Error Responses**:
```typescript
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
  }
}

// Usage
if (!property) {
  throw new AppError("Property not found", 404, "PROPERTY_NOT_FOUND");
}
```

### Testing Strategy

**Unit Tests**:
- Database operations with proper mocking
- Form validation logic
- Utility functions and helpers

**Integration Tests**:
- API endpoints with test database
- User workflows end-to-end
- Multi-tenant isolation verification

**E2E Tests**:
- Critical user journeys
- Cross-browser compatibility
- Mobile responsiveness

## Performance Considerations

### Database Optimization
- Add proper indexes for frequently queried fields
- Use database-level pagination for large datasets
- Implement proper connection pooling

### Caching Strategy
- Cache dashboard metrics with appropriate TTL
- Use React Query for client-side caching
- Implement Redis for session caching if needed

### Bundle Optimization
- Code splitting for each major feature
- Lazy loading for non-critical components
- Optimize images and assets

## Security Requirements

### Multi-tenant Isolation
- All queries must include orgId filtering
- Validate user permissions on every operation
- Audit trail for sensitive operations

### Input Validation
- Server-side validation for all inputs
- SQL injection prevention (Prisma handles this)
- XSS protection on user-generated content

### File Upload Security
- Validate file types and sizes
- Scan uploaded files for malware
- Secure file storage with proper access controls

## Deployment Considerations

### Environment Variables
- Separate configs for dev/staging/production
- Secure secret management
- Database connection pooling configuration

### Monitoring
- Application performance monitoring
- Error tracking and alerting
- Database query performance monitoring

### Backup Strategy
- Automated database backups
- File storage backups
- Disaster recovery procedures

## Success Metrics

### Functionality
- All CRUD operations working for properties, units, users, and leases
- Multi-tenant isolation verified
- Role-based permissions working correctly

### Performance
- Page load times under 2 seconds
- Database queries optimized (under 100ms average)
- Mobile responsiveness on all devices

### Quality
- 90%+ test coverage
- Zero critical security vulnerabilities
- Accessibility compliance (WCAG 2.1 AA)

## Next Steps After Phase 1

### Phase 2 Preparation
- Advanced work order management
- Financial reporting and analytics
- Document management system
- API development for mobile apps

This specification provides a comprehensive roadmap for implementing Phase 1 of the Everyday Properties system while maintaining high code quality, security, and performance standards.
