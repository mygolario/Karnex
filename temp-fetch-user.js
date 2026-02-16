
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst();
  if (user) {
    console.log("USER_ID:", user.id);
    console.log("USER_EMAIL:", user.email);
  } else {
    console.log("No users found.");
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
