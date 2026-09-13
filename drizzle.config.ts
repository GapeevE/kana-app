import type { Config } from 'drizzle-kit'
import { config } from 'dotenv'

config({ path: '.env.local', quiet: true })

export default {
  schema: './src/server/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL! },
} satisfies Config
