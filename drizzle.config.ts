import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';
import { parse } from 'pg-connection-string';
dotenv.config({ path: '.env' });

const config = parse(process.env.DATABASE_URL!);

export default defineConfig({
  schema: './src/database/schema', // Path to your schema files
  out: './drizzle', // Path for generated migration files
  dialect: 'postgresql',
  dbCredentials: {
    host: config.host!,
    port: config.port ? parseInt(config.port) : 5432,
    user: config.user!,
    password: config.password!,
    database: config.database!,
    ssl: true, // Set to false if not using SSL
  },
});
