import 'server-only';

import { auth, currentUser } from '@clerk/nextjs/server';
import { database } from '@repo/database';
import { setDatabaseContext, getCurrentDatabaseContext } from '@repo/database/nextjs-middleware';

export interface UserProfile {
  id: string;
  orgId: string;
  clerkUserId: string;
  email: string;
  fullName: string | null;
  role: 'admin' | 'manager' | 'leasing' | 'maintenance' | 'resident';
  phone: string | null;
  metadata: Record<string, any>;
}

export interface Organization {
  id: string;
  name: string;
  settings: Record<string, any>;
}

/**
 * Get the current authenticated user with their profile and organization
 * This function handles the complete user authentication flow
 */
export async function getCurrentUser(): Promise<{
  user: UserProfile | null;
  organization: Organization | null;
  isAuthenticated: boolean;
}> {
  try {
    // Get Clerk user
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return {
        user: null,
        organization: null,
        isAuthenticated: false,
      };
    }

    // Get user's active organization from Clerk
    const { orgId } = auth();
    
    if (!orgId) {
      // User is not part of any organization
      return {
        user: null,
        organization: null,
        isAuthenticated: true,
      };
    }

    // Set database context for RLS
    await setDatabaseContext({
      orgId,
      userId: clerkUser.id,
      userRole: 'unknown', // Will be determined from database
    });

    // Get user profile from database
    const userProfile = await database.userProfile.findFirst({
      where: {
        clerkUserId: clerkUser.id,
        orgId: orgId,
      },
    });

    if (!userProfile) {
      // User profile doesn't exist, create it
      const newProfile = await createUserProfile({
        clerkUserId: clerkUser.id,
        orgId: orgId,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        fullName: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null,
        phone: clerkUser.phoneNumbers[0]?.phoneNumber || null,
        role: 'resident', // Default role
        metadata: {
          clerkCreatedAt: clerkUser.createdAt,
          clerkUpdatedAt: clerkUser.updatedAt,
        },
      });

      return {
        user: newProfile,
        organization: await getOrganization(orgId),
        isAuthenticated: true,
      };
    }

    // Get organization
    const organization = await getOrganization(orgId);

    return {
      user: userProfile,
      organization,
      isAuthenticated: true,
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return {
      user: null,
      organization: null,
      isAuthenticated: false,
    };
  }
}

/**
 * Create a new user profile in the database
 */
export async function createUserProfile(data: {
  clerkUserId: string;
  orgId: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  role: 'admin' | 'manager' | 'leasing' | 'maintenance' | 'resident';
  metadata?: Record<string, any>;
}): Promise<UserProfile> {
  try {
    // Set database context
    await setDatabaseContext({
      orgId: data.orgId,
      userId: data.clerkUserId,
      userRole: data.role,
    });

    const userProfile = await database.userProfile.create({
      data: {
        clerkUserId: data.clerkUserId,
        orgId: data.orgId,
        email: data.email,
        fullName: data.fullName,
        phone: data.phone,
        role: data.role,
        metadata: data.metadata || {},
      },
    });

    return userProfile;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw new Error('Failed to create user profile');
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  orgId: string,
  updates: Partial<{
    fullName: string;
    phone: string;
    role: 'admin' | 'manager' | 'leasing' | 'maintenance' | 'resident';
    metadata: Record<string, any>;
  }>
): Promise<UserProfile | null> {
  try {
    await setDatabaseContext({
      orgId,
      userId,
      userRole: 'unknown',
    });

    const updatedProfile = await database.userProfile.update({
      where: {
        clerkUserId: userId,
        orgId: orgId,
      },
      data: updates,
    });

    return updatedProfile;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return null;
  }
}

/**
 * Get organization by ID
 */
export async function getOrganization(orgId: string): Promise<Organization | null> {
  try {
    await setDatabaseContext({
      orgId,
      userId: 'system', // System context for org lookup
      userRole: 'admin',
    });

    const org = await database.org.findUnique({
      where: { id: orgId },
    });

    return org;
  } catch (error) {
    console.error('Error getting organization:', error);
    return null;
  }
}

/**
 * Create a new organization
 */
export async function createOrganization(data: {
  name: string;
  settings?: Record<string, any>;
}): Promise<Organization> {
  try {
    const org = await database.org.create({
      data: {
        name: data.name,
        settings: data.settings || {
          timezone: 'America/New_York',
          currency: 'USD',
          lateFeeAmount: 50,
          gracePeriodDays: 5,
        },
      },
    });

    return org;
  } catch (error) {
    console.error('Error creating organization:', error);
    throw new Error('Failed to create organization');
  }
}

/**
 * Add user to organization
 */
export async function addUserToOrganization(
  clerkUserId: string,
  orgId: string,
  role: 'admin' | 'manager' | 'leasing' | 'maintenance' | 'resident' = 'resident'
): Promise<UserProfile | null> {
  try {
    // Get Clerk user data
    const clerkUser = await currentUser();
    if (!clerkUser || clerkUser.id !== clerkUserId) {
      throw new Error('User not authenticated');
    }

    // Check if user is already in this organization
    const existingProfile = await database.userProfile.findFirst({
      where: {
        clerkUserId,
        orgId,
      },
    });

    if (existingProfile) {
      return existingProfile;
    }

    // Create user profile
    const userProfile = await createUserProfile({
      clerkUserId,
      orgId,
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      fullName: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null,
      phone: clerkUser.phoneNumbers[0]?.phoneNumber || null,
      role,
      metadata: {
        clerkCreatedAt: clerkUser.createdAt,
        clerkUpdatedAt: clerkUser.updatedAt,
      },
    });

    return userProfile;
  } catch (error) {
    console.error('Error adding user to organization:', error);
    return null;
  }
}

/**
 * Remove user from organization
 */
export async function removeUserFromOrganization(
  clerkUserId: string,
  orgId: string
): Promise<boolean> {
  try {
    await setDatabaseContext({
      orgId,
      userId: clerkUserId,
      userRole: 'unknown',
    });

    await database.userProfile.deleteMany({
      where: {
        clerkUserId,
        orgId,
      },
    });

    return true;
  } catch (error) {
    console.error('Error removing user from organization:', error);
    return false;
  }
}

/**
 * Get all users in an organization
 */
export async function getOrganizationUsers(orgId: string): Promise<UserProfile[]> {
  try {
    await setDatabaseContext({
      orgId,
      userId: 'system', // System context for admin operations
      userRole: 'admin',
    });

    const users = await database.userProfile.findMany({
      where: { orgId },
      orderBy: { createdAt: 'asc' },
    });

    return users;
  } catch (error) {
    console.error('Error getting organization users:', error);
    return [];
  }
}

/**
 * Check if user has permission for a specific action
 */
export async function hasPermission(
  userId: string,
  orgId: string,
  action: 'read' | 'write' | 'admin',
  resource?: string
): Promise<boolean> {
  try {
    await setDatabaseContext({
      orgId,
      userId,
      userRole: 'unknown',
    });

    const userProfile = await database.userProfile.findFirst({
      where: {
        clerkUserId: userId,
        orgId: orgId,
      },
      select: { role: true },
    });

    if (!userProfile) {
      return false;
    }

    // Role-based permissions
    const rolePermissions = {
      admin: ['read', 'write', 'admin'],
      manager: ['read', 'write'],
      leasing: ['read', 'write'],
      maintenance: ['read', 'write'],
      resident: ['read'],
    };

    return rolePermissions[userProfile.role]?.includes(action) || false;
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
}

/**
 * Get user's current database context
 */
export async function getUserContext(): Promise<{
  orgId: string | null;
  userId: string | null;
  isAuthenticated: boolean;
}> {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return {
        orgId: null,
        userId: null,
        isAuthenticated: false,
      };
    }

    const context = await getCurrentDatabaseContext();
    
    return {
      orgId: context.orgId,
      userId: context.userId,
      isAuthenticated: true,
    };
  } catch (error) {
    console.error('Error getting user context:', error);
    return {
      orgId: null,
      userId: null,
      isAuthenticated: false,
    };
  }
}
