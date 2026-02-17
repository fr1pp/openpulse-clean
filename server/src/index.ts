import express from 'express'
import { createServer } from 'http'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { initDb } from './db/connection.js'
import { seed } from './db/seed.js'
import { config } from './lib/config.js'
import { authRouter } from './routes/auth.js'
import { vitalsRouter } from './routes/vitals.js'
import { simulatorRouter } from './routes/simulator.js'
import { initSocketServer } from './socket/index.js'

const app = express()
const httpServer = createServer(app)

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

// Routes
app.use('/api/auth', authRouter)
app.use('/api/vitals', vitalsRouter)
app.use('/api/simulator', simulatorRouter)

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Initialize Socket.io (after all middleware and routes)
const io = initSocketServer(httpServer)

// Use httpServer.listen() instead of app.listen() so Socket.io can attach
httpServer.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`)
})

export { io }
