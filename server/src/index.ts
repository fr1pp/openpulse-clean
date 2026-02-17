import express from 'express'
import { initDb } from './db/connection.js'
import { seed } from './db/seed.js'
import { config } from './lib/config.js'

const app = express()

app.use(express.json())

// Initialize database
initDb(config.dbPath)

// Auto-seed on startup (idempotent -- skips if data exists)
await seed()

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`)
})
