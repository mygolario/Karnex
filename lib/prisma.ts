import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const prismaClientSingleton = () => {
  // During build time, DATABASE_URL might not be available.
  // We use a dummy connection string to allow the build to proceed.
  // The actual connection will verify the URL at runtime.
  const connectionString = process.env.DATABASE_URL || 'postgresql://dummy:dummy@localhost:5432/dummy'
  
  // Determine if we need SSL (usually for remote DBs)
  // Liara might not support SSL on the public port, so we disable it for now or strictly follow the connection string.
  // If the server rejects SSL, we must set ssl: false.
  
  const pool = new Pool({ 
    connectionString,
    ssl: false, // Explicitly disable SSL as the server rejects it
  })
  
  // Log connection errors but don't crash the server — the pool will reconnect automatically
  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err)
  })

  const adapter = new PrismaPg(pool)
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
