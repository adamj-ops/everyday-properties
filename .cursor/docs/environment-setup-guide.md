# Environment Setup Guide - Everyday Properties

## Prerequisites
- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- Clerk account for authentication

## Step-by-Step Setup

### 1. Database Setup

#### Option A: Local PostgreSQL
```bash
# Install PostgreSQL (macOS with Homebrew)
brew install postgresql
brew services start postgresql

# Create database
createdb everyday_properties_dev
```

#### Option B: Cloud Database (Recommended)
- Use services like Supabase, PlanetScale, or Neon
- Create a new PostgreSQL database
- Note the connection string

### 2. Clerk Authentication Setup

1. Go to [clerk.com](https://clerk.com) and create an account
2. Create a new application
3. Get your keys from the dashboard:
   - `CLERK_SECRET_KEY` (from API Keys section)
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (from API Keys section)

### 3. Environment Variables Configuration

Copy all `.env.example` files to their respective `.env` files:

```bash
# From project root
cp apps/api/.env.example apps/api/.env.local
cp apps/app/.env.example apps/app/.env.local
cp apps/web/.env.example apps/web/.env.local
cp packages/cms/.env.example packages/cms/.env.local
cp packages/database/.env.example packages/database/.env
cp packages/internationalization/.env.example packages/internationalization/.env.local
```

### 4. Configure Database Environment

Edit `packages/database/.env`:
```env
# PostgreSQL connection string
DATABASE_URL="postgresql://username:password@localhost:5432/everyday_properties_dev"

# For cloud databases, use the provided connection string
# DATABASE_URL="postgresql://user:pass@host:5432/dbname?sslmode=require"
```

### 5. Configure Authentication Environment

Edit `apps/app/.env.local`:
```env
# Clerk Authentication
CLERK_SECRET_KEY="sk_test_your_secret_key_here"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_your_publishable_key_here"

# Database (same as above)
DATABASE_URL="postgresql://username:password@localhost:5432/everyday_properties_dev"
```

### 6. Configure API Environment

Edit `apps/api/.env.local`:
```env
# Clerk Authentication
CLERK_SECRET_KEY="sk_test_your_secret_key_here"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_your_publishable_key_here"

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/everyday_properties_dev"
```

### 7. Run Database Setup

```bash
# Install dependencies
npm install

# Generate Prisma client and run migrations
npm run migrate

# Seed the database with test data
cd packages/database
npm run seed
```

### 8. Verify Setup

Run the Phase 0 test suite:
```bash
npx tsx scripts/test-phase0.ts
```

All tests should pass before proceeding to Phase 1.

### 9. Start Development Server

```bash
# Start all applications
npm run dev

# Or start specific apps
npm run dev --workspace=apps/app  # Main application
npm run dev --workspace=apps/api  # API server
npm run dev --workspace=apps/web  # Marketing site
```

## Environment Variables Reference

### Required for Phase 0
- `DATABASE_URL` - PostgreSQL connection string
- `CLERK_SECRET_KEY` - Clerk authentication secret
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk public key

### Optional (for later phases)
- `STRIPE_SECRET_KEY` - Payment processing
- `STRIPE_PUBLISHABLE_KEY` - Stripe public key
- `RESEND_API_KEY` - Email notifications
- `UPLOADTHING_SECRET` - File uploads
- `UPLOADTHING_APP_ID` - File uploads

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check connection string format
- Ensure database exists
- Check firewall/network settings for cloud databases

### Clerk Authentication Issues
- Verify API keys are correct
- Check Clerk application settings
- Ensure domains are configured in Clerk dashboard

### Migration Issues
- Delete `packages/database/prisma/migrations` folder
- Run `npx prisma db push` to sync schema
- Re-run migrations

### Common Errors

**"Environment variable not found: DATABASE_URL"**
- Ensure `.env` file exists in `packages/database/`
- Check the DATABASE_URL format

**"spawnSync /bin/sh ENOENT"**
- Usually indicates missing environment variables
- Verify all required env vars are set

**Prisma relation mode warnings**
- These are warnings, not errors
- Will be addressed in database optimization phase

## Next Steps

Once environment setup is complete:
1. Verify all Phase 0 tests pass
2. Explore the seeded data in the database
3. Test authentication flow
4. Begin Phase 1 implementation

## Development Workflow

1. Make changes to code
2. Test locally with `npm run dev`
3. Run tests with `npm test`
4. Commit changes with descriptive messages
5. Push to repository

## Security Notes

- Never commit `.env` files to version control
- Use different databases for dev/staging/production
- Rotate API keys regularly
- Use strong passwords for database connections
