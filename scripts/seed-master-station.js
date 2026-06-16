const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning up existing stations...');
  await prisma.club.deleteMany({
    where: {
      OR: [
        { isStation: true },
        { frequency: { not: null } }
      ]
    }
  });

  // Find the first user (the creator)
  const creator = await prisma.user.findFirst({
    where: { pseudonym: 'testuser' } // Assuming 'testuser' is the primary identity
  });

  if (!creator) {
    console.error('No creator (testuser) found. Please run seed-test-user.js first.');
    return;
  }

  console.log('Initializing The Master Broadcast...');
  await prisma.club.create({
    data: {
      name: "The Master Broadcast",
      description: "The primary frequency of the Blackboard sanctuary. Controlled by the Creator.",
      genre: "STATION",
      frequency: 100.0,
      isStation: true,
      ownerId: creator.id,
      isPersonal: false,
    }
  });

  console.log('✅ Single Master Station initialized at 100.0 MHz');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
