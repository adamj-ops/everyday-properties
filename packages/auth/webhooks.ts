import 'server-only';

import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { database } from '@repo/database';
import { keys } from './keys';

/**
 * Handle Clerk webhook events to sync user data with our database
 */
export async function handleClerkWebhook(req: Request) {
  try {
    const WEBHOOK_SECRET = keys().CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
      throw new Error('CLERK_WEBHOOK_SECRET is not set');
    }

    // Get the headers
    const headerPayload = headers();
    const svix_id = headerPayload.get('svix-id');
    const svix_timestamp = headerPayload.get('svix-timestamp');
    const svix_signature = headerPayload.get('svix-signature');

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return new Response('Error occurred -- no svix headers', {
        status: 400,
      });
    }

    // Get the body
    const payload = await req.text();
    const body = JSON.parse(payload);

    // Create a new Svix instance with your secret.
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt: WebhookEvent;

    // Verify the payload with the headers
    try {
      evt = wh.verify(payload, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error('Error verifying webhook:', err);
      return new Response('Error occurred', {
        status: 400,
      });
    }

    // Handle the webhook
    const eventType = evt.type;
    console.log(`Webhook with an ID of ${evt.id} and type of ${eventType}`);

    switch (eventType) {
      case 'user.created':
        await handleUserCreated(evt);
        break;
      case 'user.updated':
        await handleUserUpdated(evt);
        break;
      case 'user.deleted':
        await handleUserDeleted(evt);
        break;
      case 'organizationMembership.created':
        await handleOrganizationMembershipCreated(evt);
        break;
      case 'organizationMembership.deleted':
        await handleOrganizationMembershipDeleted(evt);
        break;
      case 'organization.created':
        await handleOrganizationCreated(evt);
        break;
      case 'organization.updated':
        await handleOrganizationUpdated(evt);
        break;
      case 'organization.deleted':
        await handleOrganizationDeleted(evt);
        break;
      default:
        console.log(`Unhandled webhook event type: ${eventType}`);
    }

    return new Response('', { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('Error occurred', { status: 500 });
  }
}

/**
 * Handle user.created webhook
 */
async function handleUserCreated(evt: WebhookEvent) {
  try {
    const { id, email_addresses, first_name, last_name, phone_numbers, created_at, updated_at } = evt.data;

    console.log('User created:', id);

    // Note: We don't create a user profile here because we need an organization
    // The user profile will be created when they join an organization
    // or when they access the app for the first time
  } catch (error) {
    console.error('Error handling user.created:', error);
  }
}

/**
 * Handle user.updated webhook
 */
async function handleUserUpdated(evt: WebhookEvent) {
  try {
    const { id, email_addresses, first_name, last_name, phone_numbers, updated_at } = evt.data;

    console.log('User updated:', id);

    // Update all user profiles for this Clerk user
    const userProfiles = await database.userProfile.findMany({
      where: { clerkUserId: id },
    });

    for (const profile of userProfiles) {
      await database.userProfile.update({
        where: { id: profile.id },
        data: {
          email: email_addresses[0]?.email_address || profile.email,
          fullName: `${first_name || ''} ${last_name || ''}`.trim() || null,
          phone: phone_numbers[0]?.phone_number || null,
          metadata: {
            ...profile.metadata,
            clerkUpdatedAt: updated_at,
          },
        },
      });
    }
  } catch (error) {
    console.error('Error handling user.updated:', error);
  }
}

/**
 * Handle user.deleted webhook
 */
async function handleUserDeleted(evt: WebhookEvent) {
  try {
    const { id } = evt.data;

    console.log('User deleted:', id);

    // Delete all user profiles for this Clerk user
    await database.userProfile.deleteMany({
      where: { clerkUserId: id },
    });
  } catch (error) {
    console.error('Error handling user.deleted:', error);
  }
}

/**
 * Handle organizationMembership.created webhook
 */
async function handleOrganizationMembershipCreated(evt: WebhookEvent) {
  try {
    const { organization, public_user_data } = evt.data;
    const { id: orgId, name: orgName } = organization;
    const { user_id, email_address, first_name, last_name, phone_number } = public_user_data;

    console.log('Organization membership created:', { orgId, userId: user_id });

    // Create or update user profile
    const existingProfile = await database.userProfile.findFirst({
      where: {
        clerkUserId: user_id,
        orgId: orgId,
      },
    });

    if (existingProfile) {
      // Update existing profile
      await database.userProfile.update({
        where: { id: existingProfile.id },
        data: {
          email: email_address,
          fullName: `${first_name || ''} ${last_name || ''}`.trim() || null,
          phone: phone_number,
        },
      });
    } else {
      // Create new profile
      await database.userProfile.create({
        data: {
          clerkUserId: user_id,
          orgId: orgId,
          email: email_address,
          fullName: `${first_name || ''} ${last_name || ''}`.trim() || null,
          phone: phone_number,
          role: 'resident', // Default role
          metadata: {},
        },
      });
    }
  } catch (error) {
    console.error('Error handling organizationMembership.created:', error);
  }
}

/**
 * Handle organizationMembership.deleted webhook
 */
async function handleOrganizationMembershipDeleted(evt: WebhookEvent) {
  try {
    const { organization, public_user_data } = evt.data;
    const { id: orgId } = organization;
    const { user_id } = public_user_data;

    console.log('Organization membership deleted:', { orgId, userId: user_id });

    // Delete user profile for this organization
    await database.userProfile.deleteMany({
      where: {
        clerkUserId: user_id,
        orgId: orgId,
      },
    });
  } catch (error) {
    console.error('Error handling organizationMembership.deleted:', error);
  }
}

/**
 * Handle organization.created webhook
 */
async function handleOrganizationCreated(evt: WebhookEvent) {
  try {
    const { id, name, created_by } = evt.data;

    console.log('Organization created:', { id, name });

    // Create organization in our database
    const org = await database.org.create({
      data: {
        id: id, // Use Clerk's organization ID
        name: name,
        settings: {
          timezone: 'America/New_York',
          currency: 'USD',
          lateFeeAmount: 50,
          gracePeriodDays: 5,
        },
      },
    });

    // Create user profile for the creator
    if (created_by) {
      await database.userProfile.create({
        data: {
          clerkUserId: created_by,
          orgId: id,
          email: '', // Will be updated by user.updated webhook
          fullName: null, // Will be updated by user.updated webhook
          phone: null, // Will be updated by user.updated webhook
          role: 'admin', // Creator is admin
          metadata: {},
        },
      });
    }
  } catch (error) {
    console.error('Error handling organization.created:', error);
  }
}

/**
 * Handle organization.updated webhook
 */
async function handleOrganizationUpdated(evt: WebhookEvent) {
  try {
    const { id, name } = evt.data;

    console.log('Organization updated:', { id, name });

    // Update organization in our database
    await database.org.update({
      where: { id: id },
      data: { name: name },
    });
  } catch (error) {
    console.error('Error handling organization.updated:', error);
  }
}

/**
 * Handle organization.deleted webhook
 */
async function handleOrganizationDeleted(evt: WebhookEvent) {
  try {
    const { id } = evt.data;

    console.log('Organization deleted:', id);

    // Delete organization and all related data
    // Note: This will cascade delete due to foreign key constraints
    await database.org.delete({
      where: { id: id },
    });
  } catch (error) {
    console.error('Error handling organization.deleted:', error);
  }
}
