import { PrismaClient } from '../generated/client';

// Create Prisma client without adapter for RLS setup
const db = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

async function setupRLS() {
  console.log('🔒 Setting up Row Level Security policies...');

  try {
    // Enable RLS on all tables
    await db.$executeRaw`ALTER TABLE "orgs" ENABLE ROW LEVEL SECURITY;`;
    await db.$executeRaw`ALTER TABLE "user_profiles" ENABLE ROW LEVEL SECURITY;`;
    await db.$executeRaw`ALTER TABLE "properties" ENABLE ROW LEVEL SECURITY;`;
    await db.$executeRaw`ALTER TABLE "units" ENABLE ROW LEVEL SECURITY;`;
    await db.$executeRaw`ALTER TABLE "leases" ENABLE ROW LEVEL SECURITY;`;
    await db.$executeRaw`ALTER TABLE "lease_participants" ENABLE ROW LEVEL SECURITY;`;
    await db.$executeRaw`ALTER TABLE "ledger_entries" ENABLE ROW LEVEL SECURITY;`;
    await db.$executeRaw`ALTER TABLE "work_orders" ENABLE ROW LEVEL SECURITY;`;
    await db.$executeRaw`ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;`;

    console.log('✅ Enabled RLS on all tables');

    // Create RLS policies for orgs table
    await db.$executeRaw`
      CREATE POLICY "orgs_isolation" ON "orgs"
        USING (id::text = current_setting('app.org_id', true));
    `;

    // Create RLS policies for user_profiles table
    await db.$executeRaw`
      CREATE POLICY "user_profiles_isolation" ON "user_profiles"
        USING (org_id::text = current_setting('app.org_id', true));
    `;

    // Create RLS policies for properties table
    await db.$executeRaw`
      CREATE POLICY "properties_isolation" ON "properties"
        USING (org_id::text = current_setting('app.org_id', true));
    `;

    // Create RLS policies for units table
    await db.$executeRaw`
      CREATE POLICY "units_isolation" ON "units"
        USING (org_id::text = current_setting('app.org_id', true));
    `;

    // Create RLS policies for leases table
    await db.$executeRaw`
      CREATE POLICY "leases_isolation" ON "leases"
        USING (org_id::text = current_setting('app.org_id', true));
    `;

    // Create RLS policies for lease_participants table
    await db.$executeRaw`
      CREATE POLICY "lease_participants_isolation" ON "lease_participants"
        USING (org_id::text = current_setting('app.org_id', true));
    `;

    // Create RLS policies for ledger_entries table
    await db.$executeRaw`
      CREATE POLICY "ledger_entries_isolation" ON "ledger_entries"
        USING (org_id::text = current_setting('app.org_id', true));
    `;

    // Create RLS policies for work_orders table
    await db.$executeRaw`
      CREATE POLICY "work_orders_isolation" ON "work_orders"
        USING (org_id::text = current_setting('app.org_id', true));
    `;

    // Create RLS policies for notifications table
    await db.$executeRaw`
      CREATE POLICY "notifications_isolation" ON "notifications"
        USING (org_id::text = current_setting('app.org_id', true));
    `;

    console.log('✅ Created basic isolation policies');

    // Create additional policies for resident-specific access
    await db.$executeRaw`
      CREATE POLICY "user_profiles_self_access" ON "user_profiles"
        FOR ALL USING (
          org_id::text = current_setting('app.org_id', true) AND
          (role = 'resident' AND clerk_user_id = current_setting('app.user_id', true))
        );
    `;

    await db.$executeRaw`
      CREATE POLICY "leases_resident_access" ON "leases"
        FOR SELECT USING (
          org_id::text = current_setting('app.org_id', true) AND
          (
            primary_resident_id IN (
              SELECT id FROM user_profiles 
              WHERE clerk_user_id = current_setting('app.user_id', true)
            )
            OR
            id IN (
              SELECT lease_id FROM lease_participants 
              WHERE user_profile_id IN (
                SELECT id FROM user_profiles 
                WHERE clerk_user_id = current_setting('app.user_id', true)
              )
            )
          )
        );
    `;

    await db.$executeRaw`
      CREATE POLICY "work_orders_resident_access" ON "work_orders"
        FOR SELECT USING (
          org_id::text = current_setting('app.org_id', true) AND
          (
            requested_by IN (
              SELECT id FROM user_profiles 
              WHERE clerk_user_id = current_setting('app.user_id', true)
            )
            OR
            unit_id IN (
              SELECT u.id FROM units u
              JOIN leases l ON l.unit_id = u.id
              WHERE l.primary_resident_id IN (
                SELECT id FROM user_profiles 
                WHERE clerk_user_id = current_setting('app.user_id', true)
              )
            )
          )
        );
    `;

    await db.$executeRaw`
      CREATE POLICY "notifications_resident_access" ON "notifications"
        FOR SELECT USING (
          org_id::text = current_setting('app.org_id', true) AND
          user_profile_id IN (
            SELECT id FROM user_profiles 
            WHERE clerk_user_id = current_setting('app.user_id', true)
          )
        );
    `;

    console.log('✅ Created resident-specific access policies');

    // Create indexes for better RLS performance
    await db.$executeRaw`
      CREATE INDEX IF NOT EXISTS "idx_user_profiles_org_clerk" 
      ON "user_profiles" ("org_id", "clerk_user_id");
    `;

    await db.$executeRaw`
      CREATE INDEX IF NOT EXISTS "idx_leases_org_primary_resident" 
      ON "leases" ("org_id", "primary_resident_id");
    `;

    await db.$executeRaw`
      CREATE INDEX IF NOT EXISTS "idx_lease_participants_lease_user" 
      ON "lease_participants" ("lease_id", "user_profile_id");
    `;

    await db.$executeRaw`
      CREATE INDEX IF NOT EXISTS "idx_work_orders_org_requested_by" 
      ON "work_orders" ("org_id", "requested_by");
    `;

    await db.$executeRaw`
      CREATE INDEX IF NOT EXISTS "idx_notifications_org_user" 
      ON "notifications" ("org_id", "user_profile_id");
    `;

    console.log('✅ Created performance indexes');

    // Create helper functions
    await db.$executeRaw`
      CREATE OR REPLACE FUNCTION set_database_context(org_id_param text, user_id_param text)
      RETURNS void AS $$
      BEGIN
        PERFORM set_config('app.org_id', org_id_param, true);
        PERFORM set_config('app.user_id', user_id_param, true);
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;

    await db.$executeRaw`
      CREATE OR REPLACE FUNCTION get_database_context()
      RETURNS TABLE(org_id text, user_id text) AS $$
      BEGIN
        RETURN QUERY
        SELECT 
          current_setting('app.org_id', true) as org_id,
          current_setting('app.user_id', true) as user_id;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;

    console.log('✅ Created helper functions');

    console.log('🎉 RLS setup completed successfully!');

  } catch (error) {
    console.error('❌ Error setting up RLS:', error);
    throw error;
  } finally {
    await db.$disconnect();
  }
}

// Run setup if called directly
if (require.main === module) {
  setupRLS().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

export { setupRLS };
