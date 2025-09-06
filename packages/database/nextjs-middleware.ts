import { NextRequest, NextResponse } from 'next/server';
import { database } from './index';

/**
 * Next.js middleware for database context management
 * This middleware should be used in Next.js API routes and server actions
 * to ensure proper RLS context is set for each request.
 */

export interface DatabaseContext {
  orgId: string;
  userId: string;
  userRole: string;
}

/**
 * Set the database context for RLS
 * This function should be called at the beginning of each API route
 * or server action to ensure proper data isolation
 */
export async function setDatabaseContext(context: DatabaseContext): Promise<void> {
  try {
    // Set the organization and user context for RLS
    await database.$executeRaw`SELECT set_config('app.org_id', ${context.orgId}, true)`;
    await database.$executeRaw`SELECT set_config('app.user_id', ${context.userId}, true)`;
  } catch (error) {
    console.error('Failed to set database context:', error);
    throw new Error('Database context setup failed');
  }
}

/**
 * Get the current database context
 * Returns the current org_id and user_id from the database session
 */
export async function getCurrentDatabaseContext(): Promise<{
  orgId: string | null;
  userId: string | null;
}> {
  try {
    const [orgResult, userResult] = await Promise.all([
      database.$queryRaw`SELECT current_setting('app.org_id', true) as org_id`,
      database.$queryRaw`SELECT current_setting('app.user_id', true) as user_id`,
    ]);
    
    return {
      orgId: (orgResult as any)[0]?.org_id || null,
      userId: (userResult as any)[0]?.user_id || null,
    };
  } catch (error) {
    console.error('Failed to get database context:', error);
    return { orgId: null, userId: null };
  }
}

/**
 * Middleware wrapper for API routes that require database context
 * This ensures RLS is properly set up before processing the request
 */
export function withDatabaseContext(
  handler: (req: NextRequest, context: DatabaseContext) => Promise<NextResponse>
) {
  return async (req: NextRequest, context: DatabaseContext): Promise<NextResponse> => {
    try {
      // Set the database context before processing the request
      await setDatabaseContext(context);
      
      // Call the original handler
      return await handler(req, context);
    } catch (error) {
      console.error('Database context middleware error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

/**
 * Helper function to create database context from Clerk user data
 * This will be used when integrating with Clerk authentication
 */
export function createDatabaseContextFromClerk(
  clerkUserId: string,
  orgId: string,
  userRole: string = 'resident'
): DatabaseContext {
  return {
    orgId,
    userId: clerkUserId,
    userRole,
  };
}

/**
 * Validate that the user has access to the specified organization
 * This function checks if the user is a member of the organization
 */
export async function validateOrgAccess(
  userId: string,
  orgId: string
): Promise<boolean> {
  try {
    // Set context temporarily for the validation query
    await setDatabaseContext({ orgId, userId, userRole: 'unknown' });
    
    const userProfile = await database.userProfile.findFirst({
      where: {
        clerkUserId: userId,
        orgId: orgId,
      },
      select: {
        id: true,
        role: true,
      },
    });
    
    return !!userProfile;
  } catch (error) {
    console.error('Failed to validate org access:', error);
    return false;
  }
}

/**
 * Get user profile with proper RLS context
 * This function ensures the user can only access their own profile
 */
export async function getUserProfile(
  userId: string,
  orgId: string
): Promise<{
  id: string;
  email: string;
  fullName: string | null;
  role: string;
  phone: string | null;
} | null> {
  try {
    await setDatabaseContext({ orgId, userId, userRole: 'unknown' });
    
    const profile = await database.userProfile.findFirst({
      where: {
        clerkUserId: userId,
        orgId: orgId,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        phone: true,
      },
    });
    
    return profile;
  } catch (error) {
    console.error('Failed to get user profile:', error);
    return null;
  }
}

/**
 * Database transaction wrapper with RLS context
 * This ensures RLS context is maintained throughout the transaction
 */
export async function withDatabaseTransaction<T>(
  context: DatabaseContext,
  operation: (tx: typeof database) => Promise<T>
): Promise<T> {
  return await database.$transaction(async (tx) => {
    // Set context for the transaction
    await tx.$executeRaw`SELECT set_config('app.org_id', ${context.orgId}, true)`;
    await tx.$executeRaw`SELECT set_config('app.user_id', ${context.userId}, true)`;
    
    // Execute the operation
    return await operation(tx);
  });
}

/**
 * Test RLS isolation
 * This function can be used to verify that RLS is working correctly
 */
export async function testRLSIsolation(
  context1: DatabaseContext,
  context2: DatabaseContext
): Promise<{
  context1CanSeeOwnData: boolean;
  context1CannotSeeContext2Data: boolean;
  context2CanSeeOwnData: boolean;
  context2CannotSeeContext1Data: boolean;
}> {
  try {
    // Test context 1
    await setDatabaseContext(context1);
    const context1Data = await database.org.findMany();
    const context1DataCount = context1Data.length;
    
    // Test context 2
    await setDatabaseContext(context2);
    const context2Data = await database.org.findMany();
    const context2DataCount = context2Data.length;
    
    return {
      context1CanSeeOwnData: context1DataCount > 0,
      context1CannotSeeContext2Data: context1DataCount === 1, // Should only see their own org
      context2CanSeeOwnData: context2DataCount > 0,
      context2CannotSeeContext1Data: context2DataCount === 1, // Should only see their own org
    };
  } catch (error) {
    console.error('RLS isolation test failed:', error);
    throw error;
  }
}
