/**
 * Use this script to promote your new account to Admin.
 * Usage: node scripts/promote-admin.js YOUR_PSEUDONYM
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const pseudonym = process.argv[2];
  if (!pseudonym) {
    console.error('Please provide your pseudonym: node scripts/promote-admin.js MyName');
    return;
  }

  const user = await prisma.user.findUnique({ where: { pseudonym } });
  if (!user) {
    console.error(`User "${pseudonym}" not found.`);
    return;
  }

  // Update user to Admin and set as owner of MASTER FM
  await prisma.user.update({
    where: { id: user.id },
    data: { isAdmin: true }
  });

  await prisma.club.update({
    where: { frequency: 100.0 },
    data: { ownerId: user.id }
  });

  console.log(`\n👑 Authority Granted.`);
  console.log(`User "${pseudonym}" is now the Primary Creator.`);
  console.log(`MASTER FM is now under your control.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
