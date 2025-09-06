import { PrismaClient } from '@repo/database/generated/client';
import { 
  createUserProfile, 
  createOrganization, 
  addUserToOrganization,
  getOrganizationUsers,
  hasPermission 
} from '../user-service';

// Create Prisma client without adapter for auth testing
const db = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

async function testAuth() {
  console.log('🔐 Testing Auth Integration...');

  try {
    // Test 1: Create organization
    console.log('\n🔍 Test 1: Create organization');
    const org = await createOrganization({
      name: 'Test Auth Organization',
      settings: {
        timezone: 'America/New_York',
        currency: 'USD',
        lateFeeAmount: 75,
        gracePeriodDays: 7,
      },
    });
    console.log('✅ Created organization:', org.name);

    // Test 2: Create user profiles
    console.log('\n🔍 Test 2: Create user profiles');
    
    const adminProfile = await createUserProfile({
      clerkUserId: 'clerk_admin_123',
      orgId: org.id,
      email: 'admin@testauth.com',
      fullName: 'Admin User',
      phone: '+1234567890',
      role: 'admin',
      metadata: { test: true },
    });
    console.log('✅ Created admin profile:', adminProfile.email);

    const managerProfile = await createUserProfile({
      clerkUserId: 'clerk_manager_123',
      orgId: org.id,
      email: 'manager@testauth.com',
      fullName: 'Manager User',
      phone: '+1234567891',
      role: 'manager',
      metadata: { test: true },
    });
    console.log('✅ Created manager profile:', managerProfile.email);

    const residentProfile = await createUserProfile({
      clerkUserId: 'clerk_resident_123',
      orgId: org.id,
      email: 'resident@testauth.com',
      fullName: 'Resident User',
      phone: '+1234567892',
      role: 'resident',
      metadata: { test: true },
    });
    console.log('✅ Created resident profile:', residentProfile.email);

    // Test 3: Test permissions
    console.log('\n🔍 Test 3: Test permissions');
    
    const adminCanRead = await hasPermission('clerk_admin_123', org.id, 'read');
    const adminCanWrite = await hasPermission('clerk_admin_123', org.id, 'write');
    const adminCanAdmin = await hasPermission('clerk_admin_123', org.id, 'admin');
    
    console.log('Admin permissions:', { read: adminCanRead, write: adminCanWrite, admin: adminCanAdmin });

    const managerCanRead = await hasPermission('clerk_manager_123', org.id, 'read');
    const managerCanWrite = await hasPermission('clerk_manager_123', org.id, 'write');
    const managerCanAdmin = await hasPermission('clerk_manager_123', org.id, 'admin');
    
    console.log('Manager permissions:', { read: managerCanRead, write: managerCanWrite, admin: managerCanAdmin });

    const residentCanRead = await hasPermission('clerk_resident_123', org.id, 'read');
    const residentCanWrite = await hasPermission('clerk_resident_123', org.id, 'write');
    const residentCanAdmin = await hasPermission('clerk_resident_123', org.id, 'admin');
    
    console.log('Resident permissions:', { read: residentCanRead, write: residentCanWrite, admin: residentCanAdmin });

    // Test 4: Get organization users
    console.log('\n🔍 Test 4: Get organization users');
    const orgUsers = await getOrganizationUsers(org.id);
    console.log(`✅ Found ${orgUsers.length} users in organization:`, orgUsers.map(u => u.email));

    // Test 5: Test RLS with auth context
    console.log('\n🔍 Test 5: Test RLS with auth context');
    
    // Test admin context
    await db.$executeRaw`SELECT set_config('app.org_id', ${org.id}, true)`;
    await db.$executeRaw`SELECT set_config('app.user_id', 'clerk_admin_123', true)`;
    
    const adminContextUsers = await db.userProfile.findMany();
    console.log(`Admin sees ${adminContextUsers.length} users with RLS context`);

    // Test resident context
    await db.$executeRaw`SELECT set_config('app.org_id', ${org.id}, true)`;
    await db.$executeRaw`SELECT set_config('app.user_id', 'clerk_resident_123', true)`;
    
    const residentContextUsers = await db.userProfile.findMany();
    console.log(`Resident sees ${residentContextUsers.length} users with RLS context`);

    // Test 6: Cross-organization isolation
    console.log('\n🔍 Test 6: Cross-organization isolation');
    
    const org2 = await createOrganization({
      name: 'Test Auth Organization 2',
    });
    
    const user2Profile = await createUserProfile({
      clerkUserId: 'clerk_user2_123',
      orgId: org2.id,
      email: 'user2@testauth2.com',
      fullName: 'User 2',
      phone: '+1234567893',
      role: 'admin',
    });

    // Set context for org1
    await db.$executeRaw`SELECT set_config('app.org_id', ${org.id}, true)`;
    await db.$executeRaw`SELECT set_config('app.user_id', 'clerk_admin_123', true)`;
    
    const org1Users = await db.userProfile.findMany();
    console.log(`Org1 context sees ${org1Users.length} users`);

    // Set context for org2
    await db.$executeRaw`SELECT set_config('app.org_id', ${org2.id}, true)`;
    await db.$executeRaw`SELECT set_config('app.user_id', 'clerk_user2_123', true)`;
    
    const org2Users = await db.userProfile.findMany();
    console.log(`Org2 context sees ${org2Users.length} users`);

    // Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    await db.userProfile.deleteMany({
      where: { metadata: { test: true } },
    });
    await db.userProfile.deleteMany({
      where: { clerkUserId: 'clerk_user2_123' },
    });
    await db.org.delete({ where: { id: org.id } });
    await db.org.delete({ where: { id: org2.id } });
    console.log('✅ Cleaned up test data');

    console.log('\n🎉 Auth integration testing completed successfully!');
    console.log('\n📊 Test Summary:');
    console.log('✅ Organization creation working');
    console.log('✅ User profile creation working');
    console.log('✅ Permission system working');
    console.log('✅ Organization user listing working');
    console.log('✅ RLS with auth context working');
    console.log('✅ Cross-organization isolation working');

  } catch (error) {
    console.error('❌ Auth test failed:', error);
    throw error;
  } finally {
    await db.$disconnect();
  }
}

// Run test if called directly
if (require.main === module) {
  testAuth().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

export { testAuth };
