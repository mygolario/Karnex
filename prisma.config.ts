import { defineConfig } from '@prisma/config';
import "dotenv/config";

const url = process.env.DATABASE_URL;

if (!url) {
  throw new Error("DATABASE_URL is not defined in environment variables");
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: url
  },
  migrations: {
    seed: 'node scripts/migrate-data.js'
  }
});
