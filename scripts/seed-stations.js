const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const stations = [
    {
      name: "The Midnight Library",
      description: "Dusty shelves and whispers of forgotten tales.",
      genre: "LIBRARY",
      frequency: 104.2,
      isStation: true,
    },
    {
      name: "Solar Observatory",
      description: "Watching the sun collapse in slow motion.",
      genre: "OBSERVATORY",
      frequency: 88.5,
      isStation: true,
    },
    {
      name: "The Silent Gallery",
      description: "Walk through the canvas of the collective unconscious.",
      genre: "GALLERY",
      frequency: 92.1,
      isStation: true,
    },
    {
      name: "Async Dreams",
      description: "Non-linear transmissions for the restless.",
      genre: "ASYNC",
      frequency: 97.8,
      isStation: true,
    },
    {
      name: "The Empty Lounge",
      description: "A space to just be. No agenda, no pressure.",
      genre: "GENERAL",
      frequency: 101.5,
      isStation: false,
    }
  ];

  console.log('Seeding stations...');

  for (const s of stations) {
    await prisma.club.upsert({
      where: { frequency: s.frequency },
      update: s,
      create: s,
    });
  }

  console.log('✅ Stations seeded successfully.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
