import { describe, it, expect, beforeEach, vi } from 'vitest';
import { testDb, setTestDatabaseContext, createTestAuthData } from './setup';

// Mock Clerk functions
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
  currentUser: vi.fn(),
}));

import { auth, currentUser } from '@clerk/nextjs/server';

describe('User Service', () => {
  let testData: Awaited<ReturnType<typeof createTestAuthData>>;

  beforeEach(async () => {
    testData = await createTestAuthData();
  });

  describe('getCurrentUser', () => {
    it('should return null when user is not authenticated', async () => {
      vi.mocked(currentUser).mockResolvedValue(null);
      vi.mocked(auth).mockReturnValue({ userId: null, orgId: null });

      // Import the function after mocking
      const { getCurrentUser } = await import('../user-service');
      
      const result = await getCurrentUser();
      
      expect(result.user).toBeNull();
      expect(result.organization).toBeNull();
      expect(result.isAuthenticated).toBe(false);
    });

    it('should return null when user is not in an organization', async () => {
      vi.mocked(currentUser).mockResolvedValue({
        id: 'clerk_user_123',
        emailAddresses: [{ emailAddress: 'user@test.com' }],
        firstName: 'Test',
        lastName: 'User',
        phoneNumbers: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);
      vi.mocked(auth).mockReturnValue({ userId: 'clerk_user_123', orgId: null });

      const { getCurrentUser } = await import('../user-service');
      
      const result = await getCurrentUser();
      
      expect(result.user).toBeNull();
      expect(result.organization).toBeNull();
      expect(result.isAuthenticated).toBe(true);
    });

    it('should create user profile when user joins organization', async () => {
      vi.mocked(currentUser).mockResolvedValue({
        id: 'clerk_new_user_123',
        emailAddresses: [{ emailAddress: 'newuser@test.com' }],
        firstName: 'New',
        lastName: 'User',
        phoneNumbers: [{ phoneNumber: '+1234567899' }],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);
      vi.mocked(auth).mockReturnValue({ 
        userId: 'clerk_new_user_123', 
        orgId: testData.org.id 
      });

      const { getCurrentUser } = await import('../user-service');
      
      const result = await getCurrentUser();
      
      expect(result.user).toBeDefined();
      expect(result.user?.email).toBe('newuser@test.com');
      expect(result.user?.fullName).toBe('New User');
      expect(result.user?.phone).toBe('+1234567899');
      expect(result.user?.role).toBe('resident'); // Default role
      expect(result.organization?.id).toBe(testData.org.id);
      expect(result.isAuthenticated).toBe(true);
    });

    it('should return existing user profile', async () => {
      vi.mocked(currentUser).mockResolvedValue({
        id: testData.admin.clerkUserId,
        emailAddresses: [{ emailAddress: testData.admin.email }],
        firstName: 'Test',
        lastName: 'Admin',
        phoneNumbers: [{ phoneNumber: testData.admin.phone! }],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);
      vi.mocked(auth).mockReturnValue({ 
        userId: testData.admin.clerkUserId, 
        orgId: testData.org.id 
      });

      const { getCurrentUser } = await import('../user-service');
      
      const result = await getCurrentUser();
      
      expect(result.user).toBeDefined();
      expect(result.user?.id).toBe(testData.admin.id);
      expect(result.user?.email).toBe(testData.admin.email);
      expect(result.user?.role).toBe('admin');
      expect(result.organization?.id).toBe(testData.org.id);
      expect(result.isAuthenticated).toBe(true);
    });
  });

  describe('createUserProfile', () => {
    it('should create user profile with all fields', async () => {
      const { createUserProfile } = await import('../user-service');
      
      const userProfile = await createUserProfile({
        clerkUserId: 'clerk_test_123',
        orgId: testData.org.id,
        email: 'test@example.com',
        fullName: 'Test User',
        phone: '+1234567899',
        role: 'manager',
        metadata: { test: true },
      });

      expect(userProfile.clerkUserId).toBe('clerk_test_123');
      expect(userProfile.email).toBe('test@example.com');
      expect(userProfile.fullName).toBe('Test User');
      expect(userProfile.phone).toBe('+1234567899');
      expect(userProfile.role).toBe('manager');
      expect(userProfile.metadata).toEqual({ test: true });
      expect(userProfile.orgId).toBe(testData.org.id);

      // Clean up
      await testDb.userProfile.delete({ where: { id: userProfile.id } });
    });
  });

  describe('updateUserProfile', () => {
    it('should update user profile fields', async () => {
      const { updateUserProfile } = await import('../user-service');
      
      const updatedProfile = await updateUserProfile(
        testData.admin.clerkUserId,
        testData.org.id,
        {
          fullName: 'Updated Admin Name',
          phone: '+9876543210',
          role: 'admin',
          metadata: { updated: true },
        }
      );

      expect(updatedProfile).toBeDefined();
      expect(updatedProfile?.fullName).toBe('Updated Admin Name');
      expect(updatedProfile?.phone).toBe('+9876543210');
      expect(updatedProfile?.metadata).toEqual({ updated: true });
    });

    it('should return null for non-existent user', async () => {
      const { updateUserProfile } = await import('../user-service');
      
      const result = await updateUserProfile(
        'non_existent_user',
        testData.org.id,
        { fullName: 'Updated Name' }
      );

      expect(result).toBeNull();
    });
  });

  describe('getOrganization', () => {
    it('should return organization by ID', async () => {
      const { getOrganization } = await import('../user-service');
      
      const org = await getOrganization(testData.org.id);
      
      expect(org).toBeDefined();
      expect(org?.id).toBe(testData.org.id);
      expect(org?.name).toBe(testData.org.name);
    });

    it('should return null for non-existent organization', async () => {
      const { getOrganization } = await import('../user-service');
      
      const org = await getOrganization('non_existent_org_id');
      
      expect(org).toBeNull();
    });
  });

  describe('createOrganization', () => {
    it('should create organization with default settings', async () => {
      const { createOrganization } = await import('../user-service');
      
      const org = await createOrganization({
        name: 'New Test Organization',
        settings: {
          timezone: 'America/Los_Angeles',
          currency: 'CAD',
        },
      });

      expect(org.name).toBe('New Test Organization');
      expect(org.settings).toEqual({
        timezone: 'America/Los_Angeles',
        currency: 'CAD',
      });

      // Clean up
      await testDb.org.delete({ where: { id: org.id } });
    });

    it('should create organization with default settings when none provided', async () => {
      const { createOrganization } = await import('../user-service');
      
      const org = await createOrganization({
        name: 'Default Settings Organization',
      });

      expect(org.name).toBe('Default Settings Organization');
      expect(org.settings).toEqual({
        timezone: 'America/New_York',
        currency: 'USD',
        lateFeeAmount: 50,
        gracePeriodDays: 5,
      });

      // Clean up
      await testDb.org.delete({ where: { id: org.id } });
    });
  });

  describe('addUserToOrganization', () => {
    it('should add user to organization', async () => {
      vi.mocked(currentUser).mockResolvedValue({
        id: 'clerk_new_member_123',
        emailAddresses: [{ emailAddress: 'newmember@test.com' }],
        firstName: 'New',
        lastName: 'Member',
        phoneNumbers: [{ phoneNumber: '+1234567898' }],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const { addUserToOrganization } = await import('../user-service');
      
      const userProfile = await addUserToOrganization(
        'clerk_new_member_123',
        testData.org.id,
        'manager'
      );

      expect(userProfile).toBeDefined();
      expect(userProfile?.clerkUserId).toBe('clerk_new_member_123');
      expect(userProfile?.orgId).toBe(testData.org.id);
      expect(userProfile?.role).toBe('manager');

      // Clean up
      await testDb.userProfile.delete({ where: { id: userProfile!.id } });
    });

    it('should return existing profile if user already in organization', async () => {
      const { addUserToOrganization } = await import('../user-service');
      
      const userProfile = await addUserToOrganization(
        testData.admin.clerkUserId,
        testData.org.id,
        'admin'
      );

      expect(userProfile).toBeDefined();
      expect(userProfile?.id).toBe(testData.admin.id);
    });
  });

  describe('removeUserFromOrganization', () => {
    it('should remove user from organization', async () => {
      const { removeUserFromOrganization } = await import('../user-service');
      
      const result = await removeUserFromOrganization(
        testData.resident.clerkUserId,
        testData.org.id
      );

      expect(result).toBe(true);

      // Verify user is removed
      const userProfile = await testDb.userProfile.findFirst({
        where: {
          clerkUserId: testData.resident.clerkUserId,
          orgId: testData.org.id,
        },
      });

      expect(userProfile).toBeNull();
    });

    it('should return false for non-existent user', async () => {
      const { removeUserFromOrganization } = await import('../user-service');
      
      const result = await removeUserFromOrganization(
        'non_existent_user',
        testData.org.id
      );

      expect(result).toBe(false);
    });
  });

  describe('getOrganizationUsers', () => {
    it('should return all users in organization', async () => {
      const { getOrganizationUsers } = await import('../user-service');
      
      const users = await getOrganizationUsers(testData.org.id);
      
      expect(users).toHaveLength(3);
      expect(users.map(u => u.email)).toContain('admin@testauth.com');
      expect(users.map(u => u.email)).toContain('manager@testauth.com');
      expect(users.map(u => u.email)).toContain('resident@testauth.com');
    });

    it('should return empty array for non-existent organization', async () => {
      const { getOrganizationUsers } = await import('../user-service');
      
      const users = await getOrganizationUsers('non_existent_org_id');
      
      expect(users).toHaveLength(0);
    });
  });

  describe('hasPermission', () => {
    it('should return true for admin permissions', async () => {
      const { hasPermission } = await import('../user-service');
      
      const canRead = await hasPermission(testData.admin.clerkUserId, testData.org.id, 'read');
      const canWrite = await hasPermission(testData.admin.clerkUserId, testData.org.id, 'write');
      const canAdmin = await hasPermission(testData.admin.clerkUserId, testData.org.id, 'admin');

      expect(canRead).toBe(true);
      expect(canWrite).toBe(true);
      expect(canAdmin).toBe(true);
    });

    it('should return true for manager permissions', async () => {
      const { hasPermission } = await import('../user-service');
      
      const canRead = await hasPermission(testData.manager.clerkUserId, testData.org.id, 'read');
      const canWrite = await hasPermission(testData.manager.clerkUserId, testData.org.id, 'write');
      const canAdmin = await hasPermission(testData.manager.clerkUserId, testData.org.id, 'admin');

      expect(canRead).toBe(true);
      expect(canWrite).toBe(true);
      expect(canAdmin).toBe(false);
    });

    it('should return limited permissions for resident', async () => {
      const { hasPermission } = await import('../user-service');
      
      const canRead = await hasPermission(testData.resident.clerkUserId, testData.org.id, 'read');
      const canWrite = await hasPermission(testData.resident.clerkUserId, testData.org.id, 'write');
      const canAdmin = await hasPermission(testData.resident.clerkUserId, testData.org.id, 'admin');

      expect(canRead).toBe(true);
      expect(canWrite).toBe(false);
      expect(canAdmin).toBe(false);
    });

    it('should return false for non-existent user', async () => {
      const { hasPermission } = await import('../user-service');
      
      const result = await hasPermission('non_existent_user', testData.org.id, 'read');

      expect(result).toBe(false);
    });
  });

  describe('getUserContext', () => {
    it('should return user context when authenticated', async () => {
      vi.mocked(auth).mockReturnValue({ 
        userId: testData.admin.clerkUserId, 
        orgId: testData.org.id 
      });

      const { getUserContext } = await import('../user-service');
      
      const context = await getUserContext();
      
      expect(context.isAuthenticated).toBe(true);
      expect(context.userId).toBe(testData.admin.clerkUserId);
      expect(context.orgId).toBe(testData.org.id);
    });

    it('should return unauthenticated context when no user', async () => {
      vi.mocked(auth).mockReturnValue({ userId: null, orgId: null });

      const { getUserContext } = await import('../user-service');
      
      const context = await getUserContext();
      
      expect(context.isAuthenticated).toBe(false);
      expect(context.userId).toBeNull();
      expect(context.orgId).toBeNull();
    });
  });
});
