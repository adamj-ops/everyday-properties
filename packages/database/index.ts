import 'server-only';

import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';
import { PrismaClient } from './generated/client';
import { keys } from './keys';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: keys().DATABASE_URL });
const adapter = new PrismaNeon(pool);

export const database = globalForPrisma.prisma || new PrismaClient({ 
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = database;
}

// Database context for RLS
export async function setDatabaseContext(orgId: string, userId: string) {
  await database.$executeRaw`SET LOCAL app.org_id = ${orgId}`;
  await database.$executeRaw`SET LOCAL app.user_id = ${userId}`;
}

// Helper function to get current org and user from context
export async function getCurrentContext() {
  const [orgResult, userResult] = await Promise.all([
    database.$queryRaw`SELECT current_setting('app.org_id', true) as org_id`,
    database.$queryRaw`SELECT current_setting('app.user_id', true) as user_id`,
  ]);
  
  return {
    orgId: (orgResult as any)[0]?.org_id,
    userId: (userResult as any)[0]?.user_id,
  };
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await database.$disconnect();
});

export * from './generated/client';
export * from './env';
