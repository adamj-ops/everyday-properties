-- CreateEnum
CREATE TYPE "ChargeType" AS ENUM ('rent', 'deposit', 'late_fee', 'utility', 'parking', 'storage', 'credit', 'adjustment');

-- CreateEnum
CREATE TYPE "PayMethod" AS ENUM ('ach', 'card', 'cash', 'check', 'other');

-- CreateEnum
CREATE TYPE "PayStatus" AS ENUM ('pending', 'succeeded', 'failed', 'refunded', 'disputed');

-- CreateEnum
CREATE TYPE "LeaseStatus" AS ENUM ('draft', 'active', 'pending', 'terminated', 'renewed');

-- CreateEnum
CREATE TYPE "UnitStatus" AS ENUM ('vacant', 'occupied', 'make_ready', 'maintenance_hold');

-- CreateEnum
CREATE TYPE "WoPriority" AS ENUM ('low', 'medium', 'high', 'emergency');

-- CreateEnum
CREATE TYPE "WoStatus" AS ENUM ('open', 'in_progress', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('email', 'sms', 'push', 'in_app');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('queued', 'sent', 'failed');

-- CreateTable
CREATE TABLE "orgs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "settings" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orgs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "clerk_user_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "full_name" TEXT,
    "role" TEXT NOT NULL,
    "phone" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "properties" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address_line1" TEXT,
    "address_line2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "postal_code" TEXT,
    "country" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "units" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "unit_number" TEXT NOT NULL,
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "sqft" INTEGER,
    "market_rent" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "status" "UnitStatus" NOT NULL DEFAULT 'vacant',
    "amenities" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leases" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "unit_id" TEXT NOT NULL,
    "primary_resident_id" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "rent" DECIMAL(12,2) NOT NULL,
    "deposit" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "status" "LeaseStatus" NOT NULL DEFAULT 'draft',
    "doc_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lease_participants" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "lease_id" TEXT NOT NULL,
    "user_profile_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,

    CONSTRAINT "lease_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ledger_entries" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "lease_id" TEXT NOT NULL,
    "entry_date" DATE NOT NULL,
    "description" TEXT,
    "charge_type" "ChargeType",
    "amount" DECIMAL(12,2) NOT NULL,
    "is_credit" BOOLEAN NOT NULL DEFAULT false,
    "external_ref" TEXT,
    "meta" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ledger_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_orders" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "unit_id" TEXT,
    "requested_by" TEXT,
    "assigned_to" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "priority" "WoPriority" NOT NULL DEFAULT 'medium',
    "status" "WoStatus" NOT NULL DEFAULT 'open',
    "photos" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "user_profile_id" TEXT,
    "channel" "NotificationChannel" NOT NULL,
    "template" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'queued',
    "error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sent_at" TIMESTAMP(3),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_org_id_clerk_user_id_key" ON "user_profiles"("org_id", "clerk_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "units_property_id_unit_number_key" ON "units"("property_id", "unit_number");

-- CreateIndex
CREATE UNIQUE INDEX "lease_participants_lease_id_user_profile_id_key" ON "lease_participants"("lease_id", "user_profile_id");
