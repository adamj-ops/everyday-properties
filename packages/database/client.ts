import { PrismaClient } from './generated/client';
import { Pool } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';

// Create Neon connection pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

// Create Prisma adapter for Neon
const adapter = new PrismaNeon(pool);

// Create Prisma client with Neon adapter
export const db = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Database context for RLS
export async function setDatabaseContext(orgId: string, userId: string) {
  await db.$executeRaw`SET LOCAL app.org_id = ${orgId}`;
  await db.$executeRaw`SET LOCAL app.user_id = ${userId}`;
}

// Helper function to get current org and user from context
export async function getCurrentContext() {
  const [orgResult, userResult] = await Promise.all([
    db.$queryRaw`SELECT current_setting('app.org_id', true) as org_id`,
    db.$queryRaw`SELECT current_setting('app.user_id', true) as user_id`,
  ]);
  
  return {
    orgId: (orgResult as any)[0]?.org_id,
    userId: (userResult as any)[0]?.user_id,
  };
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await db.$disconnect();
});
