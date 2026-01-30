/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.envelope.deleteMany();
  const data = Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    available: true,
  }));
  await prisma.envelope.createMany({ data });
  console.log('Seeded 100 envelopes.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
