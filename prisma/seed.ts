const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // สร้างผู้ใช้ใหม่
  const newUser = await prisma.users.create({
    data: {
      username: 'apex',
      profile_img: 'https://example.com/avatar.jpg',
      role: 'admin',
      accounts: {
        create: {
          email: 'apex@example.com',
          password: 'admin001',
        }
      }
    }
  });

  console.log('User created:', newUser);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });