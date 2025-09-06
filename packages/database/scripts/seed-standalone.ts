import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';
import { PrismaClient } from '../generated/client';
import { ChargeType, LeaseStatus, UnitStatus, WoPriority, WoStatus } from '../generated/client';

// Configure Neon
neonConfig.webSocketConstructor = ws;

// Create database connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaNeon(pool);
const db = new PrismaClient({ 
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Create test organization
    const org = await db.org.create({
      data: {
        name: 'Test Property Management',
        settings: {
          timezone: 'America/New_York',
          currency: 'USD',
          lateFeeAmount: 50,
          gracePeriodDays: 5,
        },
      },
    });

    console.log('✅ Created organization:', org.name);

    // Create test users
    const admin = await db.userProfile.create({
      data: {
        orgId: org.id,
        clerkUserId: 'user_admin123',
        email: 'admin@testpm.com',
        fullName: 'Admin User',
        role: 'admin',
        phone: '+1234567890',
      },
    });

    const manager = await db.userProfile.create({
      data: {
        orgId: org.id,
        clerkUserId: 'user_manager123',
        email: 'manager@testpm.com',
        fullName: 'Manager User',
        role: 'manager',
        phone: '+1234567891',
      },
    });

    const resident = await db.userProfile.create({
      data: {
        orgId: org.id,
        clerkUserId: 'user_resident123',
        email: 'resident@testpm.com',
        fullName: 'Resident User',
        role: 'resident',
        phone: '+1234567892',
      },
    });

    console.log('✅ Created users:', { admin: admin.email, manager: manager.email, resident: resident.email });

    // Create test property
    const property = await db.property.create({
      data: {
        orgId: org.id,
        name: 'Sunset Apartments',
        addressLine1: '123 Main Street',
        city: 'Anytown',
        state: 'CA',
        postalCode: '12345',
        country: 'USA',
        notes: 'Beautiful apartment complex with modern amenities',
      },
    });

    console.log('✅ Created property:', property.name);

    // Create test units
    const unit1 = await db.unit.create({
      data: {
        orgId: org.id,
        propertyId: property.id,
        unitNumber: '101',
        bedrooms: 2,
        bathrooms: 1,
        sqft: 1000,
        marketRent: 2500.00,
        status: UnitStatus.occupied,
        amenities: ['dishwasher', 'air_conditioning', 'balcony'],
      },
    });

    const unit2 = await db.unit.create({
      data: {
        orgId: org.id,
        propertyId: property.id,
        unitNumber: '102',
        bedrooms: 1,
        bathrooms: 1,
        sqft: 750,
        marketRent: 2000.00,
        status: UnitStatus.vacant,
        amenities: ['dishwasher', 'air_conditioning'],
      },
    });

    const unit3 = await db.unit.create({
      data: {
        orgId: org.id,
        propertyId: property.id,
        unitNumber: '201',
        bedrooms: 3,
        bathrooms: 2,
        sqft: 1200,
        marketRent: 3000.00,
        status: UnitStatus.make_ready,
        amenities: ['dishwasher', 'air_conditioning', 'balcony', 'in_unit_laundry'],
      },
    });

    console.log('✅ Created units:', [unit1.unitNumber, unit2.unitNumber, unit3.unitNumber]);

    // Create test lease
    const lease = await db.lease.create({
      data: {
        orgId: org.id,
        unitId: unit1.id,
        primaryResidentId: resident.id,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        rent: 2500.00,
        deposit: 2500.00,
        status: LeaseStatus.active,
        docUrl: 'https://example.com/lease-doc.pdf',
      },
    });

    console.log('✅ Created lease for unit:', unit1.unitNumber);

    // Create lease participant (guarantor)
    await db.leaseParticipant.create({
      data: {
        orgId: org.id,
        leaseId: lease.id,
        userProfileId: admin.id, // Admin as guarantor for demo
        role: 'guarantor',
      },
    });

    console.log('✅ Created lease participant');

    // Create ledger entries
    await db.ledgerEntry.createMany({
      data: [
        {
          orgId: org.id,
          leaseId: lease.id,
          entryDate: new Date('2024-01-01'),
          description: 'Security deposit',
          chargeType: ChargeType.deposit,
          amount: 2500.00,
          isCredit: false,
        },
        {
          orgId: org.id,
          leaseId: lease.id,
          entryDate: new Date('2024-01-01'),
          description: 'First month rent',
          chargeType: ChargeType.rent,
          amount: 2500.00,
          isCredit: false,
        },
        {
          orgId: org.id,
          leaseId: lease.id,
          entryDate: new Date('2024-01-01'),
          description: 'Payment received',
          amount: 5000.00,
          isCredit: true,
          externalRef: 'stripe_pi_123456789',
        },
      ],
    });

    console.log('✅ Created ledger entries');

    // Create work orders
    await db.workOrder.createMany({
      data: [
        {
          orgId: org.id,
          propertyId: property.id,
          unitId: unit1.id,
          requestedBy: resident.id,
          assignedTo: manager.id,
          title: 'Kitchen faucet leak',
          description: 'The kitchen faucet has been dripping for a week. Please fix as soon as possible.',
          priority: WoPriority.medium,
          status: WoStatus.open,
          photos: ['https://example.com/photo1.jpg'],
        },
        {
          orgId: org.id,
          propertyId: property.id,
          unitId: unit2.id,
          requestedBy: null, // System generated
          assignedTo: manager.id,
          title: 'Unit preparation for new tenant',
          description: 'Clean and prepare unit 102 for new tenant move-in.',
          priority: WoPriority.low,
          status: WoStatus.in_progress,
          photos: [],
        },
      ],
    });

    console.log('✅ Created work orders');

    // Create notifications
    await db.notification.createMany({
      data: [
        {
          orgId: org.id,
          userProfileId: resident.id,
          channel: 'email',
          template: 'payment_received',
          payload: {
            amount: 5000.00,
            leaseId: lease.id,
            unitNumber: unit1.unitNumber,
          },
          status: 'sent',
          sentAt: new Date(),
        },
        {
          orgId: org.id,
          userProfileId: manager.id,
          channel: 'in_app',
          template: 'work_order_created',
          payload: {
            workOrderId: 'wo_123',
            unitNumber: unit1.unitNumber,
            priority: 'medium',
          },
          status: 'queued',
        },
      ],
    });

    console.log('✅ Created notifications');

    console.log('🎉 Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Organization: ${org.name} (${org.id})`);
    console.log(`- Properties: 1`);
    console.log(`- Units: 3`);
    console.log(`- Users: 3`);
    console.log(`- Leases: 1`);
    console.log(`- Work Orders: 2`);
    console.log(`- Notifications: 2`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await db.$disconnect();
  }
}

// Run seed if called directly
if (require.main === module) {
  seed().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

export { seed };
