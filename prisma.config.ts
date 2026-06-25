import { defineConfig } from '@prisma/config';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load .env.local first if it exists, otherwise fall back to .env
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
} else {
  dotenv.config();
}

const url = process.env.DATABASE_URL;

if (!url) {
  throw new Error("DATABASE_URL is not defined in environment variables");
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: url,
    directUrl: process.env.DIRECT_URL
  } as any,
  migrations: {
    seed: 'node scripts/migrate-data.js'
  }
});
