import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
try {
  const d = await p.waterSource.findMany();
  console.log('WaterSource Count:', d.length);
  if (d.length > 0) console.log(JSON.stringify(d.slice(0,3), null, 2));

  const tables = await p.$queryRaw`SELECT tablename FROM pg_tables WHERE schemaname = 'public'`;
  console.log('\nAll tables:', tables.map(t => t.tablename).join(', '));
  
  // Check if there's a raw table with different name
  const rawCount = await p.$queryRaw`SELECT COUNT(*) as cnt FROM "WaterSource"`;
  console.log('\nRaw WaterSource count:', rawCount);
} catch(e) {
  console.error('ERROR:', e.message);
} finally {
  await p.$disconnect();
}
