# Agent Notes - Everyday Properties

## Project Overview
**Everyday Properties** is a comprehensive property management system built on the next-forge framework (Next.js + Turborepo). This is a multi-tenant SaaS application designed to help property managers handle:

- Property and unit management
- Lease management and tracking
- Work order management
- Financial ledger and payments
- User management with role-based access
- Notifications system

## Current Architecture

### Technology Stack
- **Framework**: Next.js 14 with Turborepo monorepo structure
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk
- **UI**: React with shadcn/ui design system
- **Deployment**: Vercel-ready configuration

### Apps Structure
- `apps/api/` - Backend API endpoints
- `apps/app/` - Main authenticated application UI
- `apps/web/` - Public marketing website
- `apps/docs/` - Documentation site
- `apps/storybook/` - Component library documentation
- `apps/studio/` - Database studio
- `apps/email/` - Email templates

### Packages Structure
- `packages/database/` - Prisma schema and database utilities
- `packages/auth/` - Clerk authentication setup
- `packages/design-system/` - Shared UI components
- `packages/analytics/` - Analytics integration
- `packages/notifications/` - Notification system
- Other supporting packages for various functionalities

## Current Status: Phase 0 Incomplete

### Issues Identified
1. **Environment Variables Missing**: DATABASE_URL, CLERK_SECRET_KEY, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
2. **Database Not Connected**: Need to set up PostgreSQL database
3. **Phase 0 Tests Failing**: All 6 tests are failing due to environment setup
4. **RLS Policies**: Need to be implemented and tested

### Phase 0 Requirements (Must Complete First)
1. Database setup with RLS (Row Level Security) policies
2. Clerk authentication integration
3. Multi-tenant isolation working
4. User management system functional
5. Environment variables configured
6. All Phase 0 tests passing

## Phase 1 Deliverables (Next Steps)

Based on the database schema analysis, Phase 1 should focus on:

### 1. Property Management Dashboard
- Properties listing and management
- Units overview and status tracking
- Occupancy rates and metrics

### 2. Basic Property Operations
- Add/edit/delete properties
- Add/edit/delete units
- Unit status management (vacant, occupied, make_ready, maintenance_hold)

### 3. User Management
- Organization setup
- User profiles and roles (admin, manager, leasing, maintenance, resident)
- Role-based access control

### 4. Basic Lease Management
- Create and manage leases
- Lease status tracking (draft, active, pending, terminated, renewed)
- Primary resident assignment

## Development Approach

### Environment Setup Priority
1. Set up local PostgreSQL database
2. Configure environment variables
3. Run database migrations
4. Seed test data
5. Verify Phase 0 tests pass

### Implementation Strategy
- Follow single responsibility principle
- Keep files under 500 lines
- Implement comprehensive testing for each feature
- Use incremental development with frequent testing
- Document all changes and decisions

## Key Database Models
- **Org**: Multi-tenant organization structure
- **UserProfile**: User management with roles
- **Property**: Property information and address
- **Unit**: Individual units within properties
- **Lease**: Lease agreements and terms
- **WorkOrder**: Maintenance and repair requests
- **LedgerEntry**: Financial transactions
- **Notification**: Communication system

## Next Actions
1. Complete Phase 0 environment setup
2. Verify all Phase 0 tests pass
3. Create detailed Phase 1 technical specification
4. Implement Phase 1 features incrementally
5. Test each feature thoroughly before moving to next

## Important Notes
- The system uses Prisma with relationMode="prisma" (needs manual indexes)
- Multi-tenant architecture with org-level isolation
- Clerk handles authentication, UserProfile handles authorization
- All models include orgId for tenant isolation
