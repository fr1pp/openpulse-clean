import { eq } from 'drizzle-orm'
import { getDb } from '../db/connection.js'
import { patients } from '../db/schema.js'

// Excludes ambiguous characters: I, O, 0, 1
const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

/**
 * Generates a unique 4-character alphanumeric access code.
 * Checks the database to ensure uniqueness before returning.
 */
export function generateAccessCode(): string {
  const db = getDb()

  let code: string
  do {
    code = Array.from({ length: 4 }, () => CHARSET[Math.floor(Math.random() * CHARSET.length)]).join('')
    const existing = db.select({ id: patients.id }).from(patients).where(eq(patients.accessCode, code)).get()
    if (!existing) {
      break
    }
  } while (true)

  return code
}
