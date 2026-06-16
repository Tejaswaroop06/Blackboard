const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Create or update a test user with email already verified
  const hashedPassword = await bcrypt.hash('testpass123', 12);
  
  const user = await prisma.user.upsert({
    where: { pseudonym: 'testuser' },
    update: {
      emailVerified: new Date(),
      password: hashedPassword,
      verificationToken: null,
      verificationTokenExpires: null,
      isAdmin: true,
    },
    create: {
      pseudonym: 'testuser',
      email: 'test@blackboard.local',
      password: hashedPassword,
      emailVerified: new Date(),
      isAdmin: true,
    },
  });
  
  console.log('Test user ready:', user.pseudonym, '| email:', user.email);
  console.log('Login with pseudonym: testuser, password: testpass123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
