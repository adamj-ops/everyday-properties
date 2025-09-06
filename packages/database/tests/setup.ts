import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { PrismaClient } from '../generated/client';

// Create test database client
const testDb = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['error'] : ['error'],
});

// Global test setup
beforeAll(async () => {
  // Ensure database is clean before running tests
  await cleanupDatabase();
});

beforeEach(async () => {
  // Clean up before each test
  await cleanupDatabase();
});

afterEach(async () => {
  // Clean up after each test
  await cleanupDatabase();
});

afterAll(async () => {
  // Final cleanup and disconnect
  await cleanupDatabase();
  await testDb.$disconnect();
});

async function cleanupDatabase() {
  try {
    // Delete in reverse order of dependencies
    await testDb.notification.deleteMany();
    await testDb.workOrder.deleteMany();
    await testDb.ledgerEntry.deleteMany();
    await testDb.leaseParticipant.deleteMany();
    await testDb.lease.deleteMany();
    await testDb.unit.deleteMany();
    await testDb.property.deleteMany();
    await testDb.userProfile.deleteMany();
    await testDb.org.deleteMany();
  } catch (error) {
    console.error('Error cleaning up database:', error);
  }
}

// Helper function to set database context for tests
export async function setTestDatabaseContext(orgId: string, userId: string) {
  await testDb.$executeRaw`SELECT set_config('app.org_id', ${orgId}, true)`;
  await testDb.$executeRaw`SELECT set_config('app.user_id', ${userId}, true)`;
}

// Helper function to create test data
export async function createTestData() {
  const org = await testDb.org.create({
    data: {
      name: 'Test Organization',
      settings: {
        timezone: 'America/New_York',
        currency: 'USD',
        lateFeeAmount: 50,
        gracePeriodDays: 5,
      },
    },
  });

  const admin = await testDb.userProfile.create({
    data: {
      orgId: org.id,
      clerkUserId: 'test_admin_123',
      email: 'admin@test.com',
      fullName: 'Test Admin',
      role: 'admin',
      phone: '+1234567890',
    },
  });

  const manager = await testDb.userProfile.create({
    data: {
      orgId: org.id,
      clerkUserId: 'test_manager_123',
      email: 'manager@test.com',
      fullName: 'Test Manager',
      role: 'manager',
      phone: '+1234567891',
    },
  });

  const resident = await testDb.userProfile.create({
    data: {
      orgId: org.id,
      clerkUserId: 'test_resident_123',
      email: 'resident@test.com',
      fullName: 'Test Resident',
      role: 'resident',
      phone: '+1234567892',
    },
  });

  const property = await testDb.property.create({
    data: {
      orgId: org.id,
      name: 'Test Property',
      addressLine1: '123 Test St',
      city: 'Test City',
      state: 'TS',
      postalCode: '12345',
      country: 'USA',
    },
  });

  const unit = await testDb.unit.create({
    data: {
      orgId: org.id,
      propertyId: property.id,
      unitNumber: '101',
      bedrooms: 2,
      bathrooms: 1,
      sqft: 1000,
      marketRent: 2000.00,
      status: 'occupied',
    },
  });

  const lease = await testDb.lease.create({
    data: {
      orgId: org.id,
      unitId: unit.id,
      primaryResidentId: resident.id,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      rent: 2000.00,
      deposit: 2000.00,
      status: 'active',
    },
  });

  return {
    org,
    admin,
    manager,
    resident,
    property,
    unit,
    lease,
  };
}

export { testDb };
