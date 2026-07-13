import { PrismaClient } from '../prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const prismaClientSingleton = () => {
  // During build time, DATABASE_URL might not be available.
  // Use a credential-free local URL so builds succeed without leaking placeholder passwords.
  // Build-time fallback only — no credentials (avoids secret scanners flagging dummy passwords).
  const connectionString =
    process.env.DATABASE_URL || "postgresql://127.0.0.1:5432/karnex_build"
  
  // Determine if we need SSL (usually for remote DBs)
  // Liara might not support SSL on the public port, so we disable it for now or strictly follow the connection string.
  // If the server rejects SSL, we must set ssl: false.
  
  const isLocalhost = connectionString.includes('localhost') || connectionString.includes('127.0.0.1')
  
  // Serverless (Vercel): default Pool max=10 per isolate exhausts Supabase
  // session limits (EMAXCONNSESSION). Keep one connection per isolate.
  const pool = new Pool({
    connectionString,
    ssl: isLocalhost ? false : { rejectUnauthorized: false },
    max: 1,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
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
  var __prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.__prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.__prisma = prisma
