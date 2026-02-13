require('dotenv').config();
console.log('DB URL:', process.env.DATABASE_URL ? 'Defined' : 'Missing');
console.log('DB URL Length:', process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0);
const { PrismaClient } = require('@prisma/client');
console.log('PrismaClient imported');
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
console.log('PrismaClient instantiated');

async function main() {
    try {
        await prisma.$connect();
        console.log('Connected!');
        await prisma.$disconnect();
    } catch (e) {
        console.error('Connection failed:');
        console.error(JSON.stringify(e, null, 2));
        console.error(e);
    }
}
main();
