import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema.js'

let db: ReturnType<typeof drizzle<typeof schema>>

export function initDb(dbPath = './openpulse.db') {
  const sqlite = new Database(dbPath)

  // Enable WAL mode for concurrent reads during writes
  sqlite.pragma('journal_mode = WAL')

  // Enable foreign key enforcement (off by default in SQLite)
  sqlite.pragma('foreign_keys = ON')

  db = drizzle({ client: sqlite, schema })
  return db
}

export function getDb() {
  if (!db) throw new Error('Database not initialized. Call initDb() first.')
  return db
}

export type AppDatabase = ReturnType<typeof initDb>
