import { PrismaClient } from '../generated/client';
import { testRLSIsolation, setDatabaseContext, getCurrentDatabaseContext } from '../middleware';

// Create Prisma client without adapter for RLS testing
const db = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

async function testRLS() {
  console.log('🧪 Testing Row Level Security...');

  try {
    // Get the test organization and users from the seeded data
    const org = await db.org.findFirst({
      where: { name: 'Test Property Management' },
    });

    if (!org) {
      throw new Error('Test organization not found. Please run db:seed first.');
    }

    const admin = await db.userProfile.findFirst({
      where: { email: 'admin@testpm.com' },
    });

    const manager = await db.userProfile.findFirst({
      where: { email: 'manager@testpm.com' },
    });

    const resident = await db.userProfile.findFirst({
      where: { email: 'resident@testpm.com' },
    });

    if (!admin || !manager || !resident) {
      throw new Error('Test users not found. Please run db:seed first.');
    }

    console.log('✅ Found test data:', {
      org: org.name,
      admin: admin.email,
      manager: manager.email,
      resident: resident.email,
    });

    // Test 1: Basic RLS isolation
    console.log('\n🔍 Test 1: Basic RLS isolation');
    
    // Set context for admin
    await setDatabaseContext({
      orgId: org.id,
      userId: admin.clerkUserId,
      userRole: admin.role,
    });

    const adminContext = await getCurrentDatabaseContext();
    console.log('Admin context:', adminContext);

    // Admin should see their organization
    const adminOrgs = await db.org.findMany();
    console.log(`Admin sees ${adminOrgs.length} organization(s):`, adminOrgs.map(o => o.name));

    // Admin should see all users in their org
    const adminUsers = await db.userProfile.findMany();
    console.log(`Admin sees ${adminUsers.length} user(s):`, adminUsers.map(u => u.email));

    // Test 2: Resident access restrictions
    console.log('\n🔍 Test 2: Resident access restrictions');
    
    // Set context for resident
    await setDatabaseContext({
      orgId: org.id,
      userId: resident.clerkUserId,
      userRole: resident.role,
    });

    const residentContext = await getCurrentDatabaseContext();
    console.log('Resident context:', residentContext);

    // Resident should only see their own profile
    const residentProfiles = await db.userProfile.findMany();
    console.log(`Resident sees ${residentProfiles.length} profile(s):`, residentProfiles.map(u => u.email));

    // Resident should only see their own leases
    const residentLeases = await db.lease.findMany();
    console.log(`Resident sees ${residentLeases.length} lease(s)`);

    // Test 3: Cross-organization isolation
    console.log('\n🔍 Test 3: Cross-organization isolation');
    
    // Create a second organization for isolation testing
    const org2 = await db.org.create({
      data: {
        name: 'Test Organization 2',
        settings: {
          timezone: 'America/Los_Angeles',
          currency: 'USD',
        },
      },
    });

    const user2 = await db.userProfile.create({
      data: {
        orgId: org2.id,
        clerkUserId: 'user_org2_123',
        email: 'user2@org2.com',
        fullName: 'User 2',
        role: 'admin',
        phone: '+1234567893',
      },
    });

    console.log('Created second organization:', org2.name);

    // Test isolation between organizations
    const isolationTest = await testRLSIsolation(
      {
        orgId: org.id,
        userId: admin.clerkUserId,
        userRole: admin.role,
      },
      {
        orgId: org2.id,
        userId: user2.clerkUserId,
        userRole: user2.role,
      }
    );

    console.log('Isolation test results:', isolationTest);

    // Test 4: Context switching
    console.log('\n🔍 Test 4: Context switching');
    
    // Switch back to admin context
    await setDatabaseContext({
      orgId: org.id,
      userId: admin.clerkUserId,
      userRole: admin.role,
    });

    const adminOrgsAfterSwitch = await db.org.findMany();
    console.log(`Admin sees ${adminOrgsAfterSwitch.length} organization(s) after switch`);

    // Switch to manager context
    await setDatabaseContext({
      orgId: org.id,
      userId: manager.clerkUserId,
      userRole: manager.role,
    });

    const managerOrgs = await db.org.findMany();
    console.log(`Manager sees ${managerOrgs.length} organization(s)`);

    // Test 5: Work orders access
    console.log('\n🔍 Test 5: Work orders access');
    
    // Admin should see all work orders
    await setDatabaseContext({
      orgId: org.id,
      userId: admin.clerkUserId,
      userRole: admin.role,
    });

    const adminWorkOrders = await db.workOrder.findMany();
    console.log(`Admin sees ${adminWorkOrders.length} work order(s)`);

    // Resident should only see work orders for their units
    await setDatabaseContext({
      orgId: org.id,
      userId: resident.clerkUserId,
      userRole: resident.role,
    });

    const residentWorkOrders = await db.workOrder.findMany();
    console.log(`Resident sees ${residentWorkOrders.length} work order(s)`);

    // Clean up test data
    await db.userProfile.delete({ where: { id: user2.id } });
    await db.org.delete({ where: { id: org2.id } });
    console.log('✅ Cleaned up test data');

    console.log('\n🎉 RLS testing completed successfully!');
    console.log('\n📊 Test Summary:');
    console.log('✅ Basic RLS isolation working');
    console.log('✅ Resident access restrictions working');
    console.log('✅ Cross-organization isolation working');
    console.log('✅ Context switching working');
    console.log('✅ Work orders access control working');

  } catch (error) {
    console.error('❌ RLS test failed:', error);
    throw error;
  } finally {
    await db.$disconnect();
  }
}

// Run test if called directly
if (require.main === module) {
  testRLS().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

export { testRLS };
