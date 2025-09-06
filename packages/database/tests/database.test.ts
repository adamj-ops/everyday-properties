import { describe, it, expect, beforeEach } from 'vitest';
import { testDb, setTestDatabaseContext, createTestData } from './setup';

describe('Database Operations', () => {
  let testData: Awaited<ReturnType<typeof createTestData>>;

  beforeEach(async () => {
    testData = await createTestData();
  });

  describe('Organization Management', () => {
    it('should create organization with default settings', async () => {
      const org = await testDb.org.create({
        data: {
          name: 'New Test Organization',
          settings: {},
        },
      });

      expect(org.name).toBe('New Test Organization');
      expect(org.settings).toEqual({});
      expect(org.id).toBeDefined();
      expect(org.createdAt).toBeDefined();

      // Clean up
      await testDb.org.delete({ where: { id: org.id } });
    });

    it('should update organization settings', async () => {
      const updatedOrg = await testDb.org.update({
        where: { id: testData.org.id },
        data: {
          settings: {
            timezone: 'America/Los_Angeles',
            currency: 'CAD',
            lateFeeAmount: 100,
            gracePeriodDays: 10,
          },
        },
      });

      expect(updatedOrg.settings).toEqual({
        timezone: 'America/Los_Angeles',
        currency: 'CAD',
        lateFeeAmount: 100,
        gracePeriodDays: 10,
      });
    });
  });

  describe('User Profile Management', () => {
    it('should create user profile with all fields', async () => {
      const userProfile = await testDb.userProfile.create({
        data: {
          orgId: testData.org.id,
          clerkUserId: 'test_user_456',
          email: 'user@test.com',
          fullName: 'Test User',
          role: 'manager',
          phone: '+1234567893',
          metadata: { test: true },
        },
      });

      expect(userProfile.email).toBe('user@test.com');
      expect(userProfile.fullName).toBe('Test User');
      expect(userProfile.role).toBe('manager');
      expect(userProfile.phone).toBe('+1234567893');
      expect(userProfile.metadata).toEqual({ test: true });
      expect(userProfile.orgId).toBe(testData.org.id);

      // Clean up
      await testDb.userProfile.delete({ where: { id: userProfile.id } });
    });

    it('should update user profile', async () => {
      const updatedProfile = await testDb.userProfile.update({
        where: { id: testData.admin.id },
        data: {
          fullName: 'Updated Admin Name',
          phone: '+9876543210',
          metadata: { updated: true },
        },
      });

      expect(updatedProfile.fullName).toBe('Updated Admin Name');
      expect(updatedProfile.phone).toBe('+9876543210');
      expect(updatedProfile.metadata).toEqual({ updated: true });
    });

    it('should enforce unique constraint on clerkUserId per organization', async () => {
      // Try to create another user with the same clerkUserId in the same org
      await expect(
        testDb.userProfile.create({
          data: {
            orgId: testData.org.id,
            clerkUserId: testData.admin.clerkUserId, // Same as existing admin
            email: 'duplicate@test.com',
            fullName: 'Duplicate User',
            role: 'resident',
          },
        })
      ).rejects.toThrow();
    });
  });

  describe('Property Management', () => {
    it('should create property with complete address', async () => {
      const property = await testDb.property.create({
        data: {
          orgId: testData.org.id,
          name: 'New Test Property',
          addressLine1: '456 New St',
          addressLine2: 'Suite 100',
          city: 'New City',
          state: 'NC',
          postalCode: '54321',
          country: 'USA',
          notes: 'Test property notes',
        },
      });

      expect(property.name).toBe('New Test Property');
      expect(property.addressLine1).toBe('456 New St');
      expect(property.addressLine2).toBe('Suite 100');
      expect(property.city).toBe('New City');
      expect(property.state).toBe('NC');
      expect(property.postalCode).toBe('54321');
      expect(property.country).toBe('USA');
      expect(property.notes).toBe('Test property notes');

      // Clean up
      await testDb.property.delete({ where: { id: property.id } });
    });
  });

  describe('Unit Management', () => {
    it('should create unit with all details', async () => {
      const unit = await testDb.unit.create({
        data: {
          orgId: testData.org.id,
          propertyId: testData.property.id,
          unitNumber: '201',
          bedrooms: 3,
          bathrooms: 2,
          sqft: 1500,
          marketRent: 3000.00,
          status: 'vacant',
          amenities: ['dishwasher', 'air_conditioning', 'balcony', 'in_unit_laundry'],
        },
      });

      expect(unit.unitNumber).toBe('201');
      expect(unit.bedrooms).toBe(3);
      expect(unit.bathrooms).toBe(2);
      expect(unit.sqft).toBe(1500);
      expect(unit.marketRent).toBe(3000.00);
      expect(unit.status).toBe('vacant');
      expect(unit.amenities).toEqual(['dishwasher', 'air_conditioning', 'balcony', 'in_unit_laundry']);

      // Clean up
      await testDb.unit.delete({ where: { id: unit.id } });
    });

    it('should enforce unique constraint on unit number per property', async () => {
      // Try to create another unit with the same unit number in the same property
      await expect(
        testDb.unit.create({
          data: {
            orgId: testData.org.id,
            propertyId: testData.property.id,
            unitNumber: testData.unit.unitNumber, // Same as existing unit
            bedrooms: 1,
            bathrooms: 1,
            sqft: 500,
            marketRent: 1000.00,
            status: 'vacant',
          },
        })
      ).rejects.toThrow();
    });
  });

  describe('Lease Management', () => {
    it('should create lease with all details', async () => {
      const lease = await testDb.lease.create({
        data: {
          orgId: testData.org.id,
          unitId: testData.unit.id,
          primaryResidentId: testData.resident.id,
          startDate: new Date('2024-06-01'),
          endDate: new Date('2025-05-31'),
          rent: 2500.00,
          deposit: 2500.00,
          status: 'active',
          docUrl: 'https://example.com/lease.pdf',
        },
      });

      expect(lease.startDate).toEqual(new Date('2024-06-01'));
      expect(lease.endDate).toEqual(new Date('2025-05-31'));
      expect(lease.rent).toBe(2500.00);
      expect(lease.deposit).toBe(2500.00);
      expect(lease.status).toBe('active');
      expect(lease.docUrl).toBe('https://example.com/lease.pdf');

      // Clean up
      await testDb.lease.delete({ where: { id: lease.id } });
    });

    it('should create lease participants', async () => {
      const leaseParticipant = await testDb.leaseParticipant.create({
        data: {
          orgId: testData.org.id,
          leaseId: testData.lease.id,
          userProfileId: testData.admin.id,
          role: 'guarantor',
        },
      });

      expect(leaseParticipant.role).toBe('guarantor');
      expect(leaseParticipant.leaseId).toBe(testData.lease.id);
      expect(leaseParticipant.userProfileId).toBe(testData.admin.id);

      // Clean up
      await testDb.leaseParticipant.delete({ where: { id: leaseParticipant.id } });
    });
  });

  describe('Ledger Management', () => {
    it('should create ledger entries for charges and payments', async () => {
      const charge = await testDb.ledgerEntry.create({
        data: {
          orgId: testData.org.id,
          leaseId: testData.lease.id,
          entryDate: new Date('2024-01-01'),
          description: 'Monthly rent',
          chargeType: 'rent',
          amount: 2000.00,
          isCredit: false,
        },
      });

      const payment = await testDb.ledgerEntry.create({
        data: {
          orgId: testData.org.id,
          leaseId: testData.lease.id,
          entryDate: new Date('2024-01-01'),
          description: 'Rent payment',
          amount: 2000.00,
          isCredit: true,
          externalRef: 'stripe_pi_123456',
        },
      });

      expect(charge.amount).toBe(2000.00);
      expect(charge.isCredit).toBe(false);
      expect(charge.chargeType).toBe('rent');

      expect(payment.amount).toBe(2000.00);
      expect(payment.isCredit).toBe(true);
      expect(payment.externalRef).toBe('stripe_pi_123456');

      // Clean up
      await testDb.ledgerEntry.delete({ where: { id: charge.id } });
      await testDb.ledgerEntry.delete({ where: { id: payment.id } });
    });
  });

  describe('Work Order Management', () => {
    it('should create work order with all details', async () => {
      const workOrder = await testDb.workOrder.create({
        data: {
          orgId: testData.org.id,
          propertyId: testData.property.id,
          unitId: testData.unit.id,
          requestedBy: testData.resident.id,
          assignedTo: testData.manager.id,
          title: 'Kitchen faucet repair',
          description: 'The kitchen faucet is leaking and needs repair',
          priority: 'high',
          status: 'open',
          photos: ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg'],
        },
      });

      expect(workOrder.title).toBe('Kitchen faucet repair');
      expect(workOrder.description).toBe('The kitchen faucet is leaking and needs repair');
      expect(workOrder.priority).toBe('high');
      expect(workOrder.status).toBe('open');
      expect(workOrder.photos).toEqual(['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg']);

      // Clean up
      await testDb.workOrder.delete({ where: { id: workOrder.id } });
    });

    it('should update work order status', async () => {
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

      const updatedWorkOrder = await testDb.workOrder.update({
        where: { id: workOrder.id },
        data: {
          status: 'in_progress',
          updatedAt: new Date(),
        },
      });

      expect(updatedWorkOrder.status).toBe('in_progress');
      expect(updatedWorkOrder.updatedAt).toBeDefined();

      // Clean up
      await testDb.workOrder.delete({ where: { id: workOrder.id } });
    });
  });

  describe('Notification Management', () => {
    it('should create notification with all details', async () => {
      const notification = await testDb.notification.create({
        data: {
          orgId: testData.org.id,
          userProfileId: testData.resident.id,
          channel: 'email',
          template: 'payment_reminder',
          payload: {
            amount: 2000.00,
            dueDate: '2024-01-01',
            leaseId: testData.lease.id,
          },
          status: 'queued',
        },
      });

      expect(notification.channel).toBe('email');
      expect(notification.template).toBe('payment_reminder');
      expect(notification.payload).toEqual({
        amount: 2000.00,
        dueDate: '2024-01-01',
        leaseId: testData.lease.id,
      });
      expect(notification.status).toBe('queued');

      // Clean up
      await testDb.notification.delete({ where: { id: notification.id } });
    });

    it('should update notification status', async () => {
      const notification = await testDb.notification.create({
        data: {
          orgId: testData.org.id,
          userProfileId: testData.resident.id,
          channel: 'email',
          template: 'test_template',
          payload: { test: true },
          status: 'queued',
        },
      });

      const updatedNotification = await testDb.notification.update({
        where: { id: notification.id },
        data: {
          status: 'sent',
          sentAt: new Date(),
        },
      });

      expect(updatedNotification.status).toBe('sent');
      expect(updatedNotification.sentAt).toBeDefined();

      // Clean up
      await testDb.notification.delete({ where: { id: notification.id } });
    });
  });
});
