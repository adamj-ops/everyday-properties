import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { PrismaClient } from '@repo/database/generated/client';

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
export async function createTestAuthData() {
  const org = await testDb.org.create({
    data: {
      name: 'Test Auth Organization',
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
      clerkUserId: 'test_auth_admin_123',
      email: 'admin@testauth.com',
      fullName: 'Test Auth Admin',
      role: 'admin',
      phone: '+1234567890',
    },
  });

  const manager = await testDb.userProfile.create({
    data: {
      orgId: org.id,
      clerkUserId: 'test_auth_manager_123',
      email: 'manager@testauth.com',
      fullName: 'Test Auth Manager',
      role: 'manager',
      phone: '+1234567891',
    },
  });

  const resident = await testDb.userProfile.create({
    data: {
      orgId: org.id,
      clerkUserId: 'test_auth_resident_123',
      email: 'resident@testauth.com',
      fullName: 'Test Auth Resident',
      role: 'resident',
      phone: '+1234567892',
    },
  });

  return {
    org,
    admin,
    manager,
    resident,
  };
}

export { testDb };
