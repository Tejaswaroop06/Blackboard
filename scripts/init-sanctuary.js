const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Ensuring Master FM Infrastructure...');
  
  // Create the Master FM channel if it doesn't exist
  // We use a fixed ID for the Master FM to make it easily referenceable
  const masterFm = await prisma.club.upsert({
    where: { frequency: 100.0 },
    update: {},
    create: {
      name: "MASTER FM",
      description: "The official frequency of the sanctuary. Transmitting the voice of the Creator.",
      genre: "STATION",
      frequency: 100.0,
      isStation: true,
      generation: 1,
    }
  });

  console.log('✅ MASTER FM Ready at 100.0 MHz');
  console.log('No user accounts exist. The first person to register will need to be manually promoted to Admin via the DB or scripts.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
