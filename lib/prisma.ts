import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const prismaClientSingleton = () => {
  // During build time, DATABASE_URL might not be available.
  // We use a dummy connection string to allow the build to proceed.
  // The actual connection will verify the URL at runtime.
  const connectionString = process.env.DATABASE_URL || 'postgresql://dummy:dummy@localhost:5432/dummy'
  
  const adapter = new PrismaPg({ connectionString })
  return new PrismaClient({
    adapter,
    log: ['warn', 'error'],
  })
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma
