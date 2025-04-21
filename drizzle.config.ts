import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

const url =
  process.env.NODE_ENV === 'production'
    ? (process.env.DATABASE_URL as string)
    : (process.env.LOCAL_DATABASE_URL as string);

export default defineConfig({
  dialect: 'postgresql',
  schema: './database/schema/*',
  out: './database/migration',
  dbCredentials: { url },
});
