// Database connection setup for Drizzle ORM
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './drizzle/schema';

// Initialize PostgreSQL client
const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

// Initialize Drizzle ORM with the schema
export const db = drizzle(pool, { schema });

// Export the schema for use in other files
export { schema };