require("dotenv").config();
const { PrismaClient } = require("../prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 1,
});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const email = process.argv[2] || "kavehcareer@gmail.com";
  const u = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" }, deletedAt: null },
  });
  if (!u) {
    console.error("User not found:", email);
    process.exit(1);
  }
  if (u.role === "admin") {
    console.log("Already admin:", u.email, u.id);
  } else {
    await prisma.user.update({ where: { id: u.id }, data: { role: "admin" } });
    console.log("Promoted:", u.email, u.id);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
