import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { initDb } from './db/connection.js'
import { seed } from './db/seed.js'
import { config } from './lib/config.js'
import { authRouter } from './routes/auth.js'

const app = express()

app.use(express.json())
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.CLIENT_URL
    : 'http://localhost:5173',
  credentials: true,
}))
app.use(cookieParser())

// Initialize database
initDb(config.dbPath)

// Auto-seed on startup (idempotent -- skips if data exists)
await seed()

// Auth routes
app.use('/api/auth', authRouter)

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`)
})
