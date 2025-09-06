-- Enable Row Level Security on all tables
-- This migration sets up RLS policies for multi-tenant isolation

-- Enable RLS on all organization-scoped tables
ALTER TABLE "orgs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "properties" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "units" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "leases" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "lease_participants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ledger_entries" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "work_orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for orgs table
-- Users can only see their own organization
CREATE POLICY "orgs_isolation" ON "orgs"
  USING (id::text = current_setting('app.org_id', true));

-- Create RLS policies for user_profiles table
-- Users can only see profiles in their organization
CREATE POLICY "user_profiles_isolation" ON "user_profiles"
  USING (org_id::text = current_setting('app.org_id', true));

-- Create RLS policies for properties table
-- Users can only see properties in their organization
CREATE POLICY "properties_isolation" ON "properties"
  USING (org_id::text = current_setting('app.org_id', true));

-- Create RLS policies for units table
-- Users can only see units in their organization
CREATE POLICY "units_isolation" ON "units"
  USING (org_id::text = current_setting('app.org_id', true));

-- Create RLS policies for leases table
-- Users can only see leases in their organization
CREATE POLICY "leases_isolation" ON "leases"
  USING (org_id::text = current_setting('app.org_id', true));

-- Create RLS policies for lease_participants table
-- Users can only see lease participants in their organization
CREATE POLICY "lease_participants_isolation" ON "lease_participants"
  USING (org_id::text = current_setting('app.org_id', true));

-- Create RLS policies for ledger_entries table
-- Users can only see ledger entries in their organization
CREATE POLICY "ledger_entries_isolation" ON "ledger_entries"
  USING (org_id::text = current_setting('app.org_id', true));

-- Create RLS policies for work_orders table
-- Users can only see work orders in their organization
CREATE POLICY "work_orders_isolation" ON "work_orders"
  USING (org_id::text = current_setting('app.org_id', true));

-- Create RLS policies for notifications table
-- Users can only see notifications in their organization
CREATE POLICY "notifications_isolation" ON "notifications"
  USING (org_id::text = current_setting('app.org_id', true));

-- Create additional policies for resident-specific access
-- Residents can only see their own user profile
CREATE POLICY "user_profiles_self_access" ON "user_profiles"
  FOR ALL USING (
    org_id::text = current_setting('app.org_id', true) AND
    (role = 'resident' AND clerk_user_id = current_setting('app.user_id', true))
  );

-- Residents can only see leases they are part of
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

-- Residents can only see work orders for their units
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

-- Residents can only see their own notifications
CREATE POLICY "notifications_resident_access" ON "notifications"
  FOR SELECT USING (
    org_id::text = current_setting('app.org_id', true) AND
    user_profile_id IN (
      SELECT id FROM user_profiles 
      WHERE clerk_user_id = current_setting('app.user_id', true)
    )
  );

-- Create indexes for better RLS performance
CREATE INDEX IF NOT EXISTS "idx_user_profiles_org_clerk" ON "user_profiles" ("org_id", "clerk_user_id");
CREATE INDEX IF NOT EXISTS "idx_leases_org_primary_resident" ON "leases" ("org_id", "primary_resident_id");
CREATE INDEX IF NOT EXISTS "idx_lease_participants_lease_user" ON "lease_participants" ("lease_id", "user_profile_id");
CREATE INDEX IF NOT EXISTS "idx_work_orders_org_requested_by" ON "work_orders" ("org_id", "requested_by");
CREATE INDEX IF NOT EXISTS "idx_notifications_org_user" ON "notifications" ("org_id", "user_profile_id");

-- Create a function to set the database context
-- This will be called by the middleware
CREATE OR REPLACE FUNCTION set_database_context(org_id_param text, user_id_param text)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.org_id', org_id_param, true);
  PERFORM set_config('app.user_id', user_id_param, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get the current context
CREATE OR REPLACE FUNCTION get_database_context()
RETURNS TABLE(org_id text, user_id text) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    current_setting('app.org_id', true) as org_id,
    current_setting('app.user_id', true) as user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
