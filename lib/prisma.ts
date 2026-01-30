import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

declare global {
  var prisma: PrismaClient | undefined;
  var prismaPool: Pool | undefined;
}

function createClient() {
  const pool =
    global.prismaPool ??
    new Pool({
      connectionString: process.env.DATABASE_URL,
    });

  if (!global.prismaPool) {
    global.prismaPool = pool;
  }

  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = global.prisma ?? createClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
