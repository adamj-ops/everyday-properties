import { describe, it, expect, beforeEach } from 'vitest';
import { testDb, setTestDatabaseContext, createTestData } from './setup';

describe('Row Level Security (RLS)', () => {
  let testData: Awaited<ReturnType<typeof createTestData>>;

  beforeEach(async () => {
    testData = await createTestData();
  });

  describe('Organization Isolation', () => {
    it('should only allow users to see their own organization data', async () => {
      // Create a second organization
      const org2 = await testDb.org.create({
        data: {
          name: 'Test Organization 2',
          settings: {},
        },
      });

      const user2 = await testDb.userProfile.create({
        data: {
          orgId: org2.id,
          clerkUserId: 'test_user2_123',
          email: 'user2@test.com',
          fullName: 'Test User 2',
          role: 'admin',
        },
      });

      // Set context for org1
      await setTestDatabaseContext(testData.org.id, testData.admin.clerkUserId);
      const org1Users = await testDb.userProfile.findMany();
      expect(org1Users).toHaveLength(3); // admin, manager, resident

      // Set context for org2
      await setTestDatabaseContext(org2.id, user2.clerkUserId);
      const org2Users = await testDb.userProfile.findMany();
      expect(org2Users).toHaveLength(1); // user2 only

      // Clean up
      await testDb.userProfile.delete({ where: { id: user2.id } });
      await testDb.org.delete({ where: { id: org2.id } });
    });

    it('should prevent cross-organization data access', async () => {
      // Create a second organization
      const org2 = await testDb.org.create({
        data: {
          name: 'Test Organization 2',
          settings: {},
        },
      });

      // Set context for org1
      await setTestDatabaseContext(testData.org.id, testData.admin.clerkUserId);
      
      // Try to access org2 data - should return empty
      const org2Data = await testDb.org.findUnique({
        where: { id: org2.id },
      });
      expect(org2Data).toBeNull();

      // Clean up
      await testDb.org.delete({ where: { id: org2.id } });
    });
  });

  describe('User Profile Access', () => {
    it('should allow admin to see all users in their organization', async () => {
      await setTestDatabaseContext(testData.org.id, testData.admin.clerkUserId);
      
      const users = await testDb.userProfile.findMany();
      expect(users).toHaveLength(3);
      expect(users.map(u => u.email)).toContain('admin@test.com');
      expect(users.map(u => u.email)).toContain('manager@test.com');
      expect(users.map(u => u.email)).toContain('resident@test.com');
    });

    it('should allow resident to see only their own profile', async () => {
      await setTestDatabaseContext(testData.org.id, testData.resident.clerkUserId);
      
      const users = await testDb.userProfile.findMany();
      expect(users).toHaveLength(1);
      expect(users[0].email).toBe('resident@test.com');
    });
  });

  describe('Lease Access', () => {
    it('should allow resident to see their own leases', async () => {
      await setTestDatabaseContext(testData.org.id, testData.resident.clerkUserId);
      
      const leases = await testDb.lease.findMany();
      expect(leases).toHaveLength(1);
      expect(leases[0].primaryResidentId).toBe(testData.resident.id);
    });

    it('should allow admin to see all leases in their organization', async () => {
      await setTestDatabaseContext(testData.org.id, testData.admin.clerkUserId);
      
      const leases = await testDb.lease.findMany();
      expect(leases).toHaveLength(1);
    });
  });

  describe('Work Orders Access', () => {
    it('should allow resident to see work orders for their units', async () => {
      // Create a work order for the resident's unit
      const workOrder = await testDb.workOrder.create({
        data: {
          orgId: testData.org.id,
          propertyId: testData.property.id,
          unitId: testData.unit.id,
          requestedBy: testData.resident.id,
          assignedTo: testData.manager.id,
          title: 'Test Work Order',
          description: 'Test description',
          priority: 'medium',
          status: 'open',
        },
      });

      await setTestDatabaseContext(testData.org.id, testData.resident.clerkUserId);
      
      const workOrders = await testDb.workOrder.findMany();
      expect(workOrders).toHaveLength(1);
      expect(workOrders[0].id).toBe(workOrder.id);
    });

    it('should allow admin to see all work orders in their organization', async () => {
      // Create a work order
      const workOrder = await testDb.workOrder.create({
        data: {
          orgId: testData.org.id,
          propertyId: testData.property.id,
          unitId: testData.unit.id,
          requestedBy: testData.resident.id,
          assignedTo: testData.manager.id,
          title: 'Test Work Order',
          description: 'Test description',
          priority: 'medium',
          status: 'open',
        },
      });

      await setTestDatabaseContext(testData.org.id, testData.admin.clerkUserId);
      
      const workOrders = await testDb.workOrder.findMany();
      expect(workOrders).toHaveLength(1);
      expect(workOrders[0].id).toBe(workOrder.id);
    });
  });

  describe('Notifications Access', () => {
    it('should allow resident to see only their own notifications', async () => {
      // Create notifications for different users
      await testDb.notification.createMany({
        data: [
          {
            orgId: testData.org.id,
            userProfileId: testData.resident.id,
            channel: 'email',
            template: 'test_template',
            payload: { test: true },
            status: 'sent',
          },
          {
            orgId: testData.org.id,
            userProfileId: testData.admin.id,
            channel: 'email',
            template: 'test_template',
            payload: { test: true },
            status: 'sent',
          },
        ],
      });

      await setTestDatabaseContext(testData.org.id, testData.resident.clerkUserId);
      
      const notifications = await testDb.notification.findMany();
      expect(notifications).toHaveLength(1);
      expect(notifications[0].userProfileId).toBe(testData.resident.id);
    });

    it('should allow admin to see all notifications in their organization', async () => {
      // Create notifications for different users
      await testDb.notification.createMany({
        data: [
          {
            orgId: testData.org.id,
            userProfileId: testData.resident.id,
            channel: 'email',
            template: 'test_template',
            payload: { test: true },
            status: 'sent',
          },
          {
            orgId: testData.org.id,
            userProfileId: testData.admin.id,
            channel: 'email',
            template: 'test_template',
            payload: { test: true },
            status: 'sent',
          },
        ],
      });

      await setTestDatabaseContext(testData.org.id, testData.admin.clerkUserId);
      
      const notifications = await testDb.notification.findMany();
      expect(notifications).toHaveLength(2);
    });
  });
});
