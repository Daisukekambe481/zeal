import { drizzle } from 'drizzle-orm/node-postgres'
import pkg from 'pg'

const { Pool } = pkg

/**
 * Drizzle database instance.
 * Import this wherever you need DB access — never create a second instance.
 * @type {import('drizzle-orm/node-postgres').NodePgDatabase}
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export const db = drizzle(pool)