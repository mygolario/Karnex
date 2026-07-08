import { defineConfig } from '@prisma/config';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load .env first
dotenv.config();
// Then overlay .env.local if it exists
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envConfig = dotenv.parse(fs.readFileSync(envLocalPath));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
}

const url = process.env.DATABASE_URL;

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: url || "postgresql://127.0.0.1:5432/karnex_build",
    directUrl: process.env.DIRECT_URL
  } as any,
  migrations: {
    seed: 'node scripts/migrate-data.js'
  }
});
