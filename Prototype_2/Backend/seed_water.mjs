import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

try {
  // Get regional offices to link water sources
  const offices = await p.regionalOffice.findMany();
  const officeMap = {};
  offices.forEach(o => officeMap[o.code] = o.id);

  console.log('Found offices:', offices.map(o => o.code).join(', '));

  const waterSources = [
    { name: 'Mahanadi River', type: 'River', lat: 21.2600, lng: 81.6500, regionId: officeMap['RO-RPR'] },
    { name: 'Shivnath River', type: 'River', lat: 21.1800, lng: 81.3400, regionId: officeMap['RO-DRG'] },
    { name: 'Hasdeo River', type: 'River', lat: 22.4000, lng: 82.6000, regionId: officeMap['RO-KRB'] },
    { name: 'Arpa River', type: 'River', lat: 22.0900, lng: 82.1500, regionId: officeMap['RO-BSP'] },
    { name: 'Kharoon River', type: 'River', lat: 21.2700, lng: 81.5800, regionId: officeMap['RO-RPR'] },
    { name: 'Tandula Reservoir', type: 'Reservoir', lat: 20.9700, lng: 81.0500, regionId: officeMap['RO-DRG'] },
    { name: 'Minimata Bango Dam', type: 'Reservoir', lat: 22.4700, lng: 81.7300, regionId: officeMap['RO-BSP'] },
    { name: 'Dudhawa Dam', type: 'Reservoir', lat: 23.0100, lng: 81.7500, regionId: officeMap['RO-BSP'] },
    { name: 'Raipur Groundwater Station', type: 'Groundwater', lat: 21.2500, lng: 81.6300, regionId: officeMap['RO-RPR'] },
    { name: 'Korba Groundwater Station', type: 'Groundwater', lat: 22.3500, lng: 82.6800, regionId: officeMap['RO-KRB'] },
    { name: 'Maniyari River', type: 'River', lat: 22.1500, lng: 82.0900, regionId: officeMap['RO-BSP'] },
    { name: 'Jonk River', type: 'River', lat: 21.0800, lng: 81.9500, regionId: officeMap['RO-RPR'] },
  ];

  // Filter out any that have undefined regionId
  const valid = waterSources.filter(s => s.regionId);
  console.log(`Creating ${valid.length} water sources...`);

  for (const source of valid) {
    await p.waterSource.create({ data: source });
  }
  
  console.log('✅ Water sources seeded successfully!');
  
  const count = await p.waterSource.count();
  console.log(`Total water sources in DB: ${count}`);
} catch(e) {
  console.error('ERROR:', e.message);
} finally {
  await p.$disconnect();
}
