import express from 'express'
import { createServer } from 'http'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { eq } from 'drizzle-orm'
import { initDb, getDb } from './db/connection.js'
import { patients } from './db/schema.js'
import { seed } from './db/seed.js'
import { config } from './lib/config.js'
import { authRouter } from './routes/auth.js'
import { vitalsRouter } from './routes/vitals.js'
import { simulatorRouter, setEngine } from './routes/simulator.js'
import { initSocketServer } from './socket/index.js'
import { BatchEmitter } from './socket/batch-emitter.js'
import { SimulatorEngine } from './simulator/engine.js'
import { persistReading } from './simulator/persistence.js'
import { startPruningSchedule } from './simulator/pruning.js'

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

// === Simulator wiring: engine -> persistence + batch emitter -> Socket.io ===

// Create batch emitter (flushes to Socket.io rooms every 1s)
const batchEmitter = new BatchEmitter(io)

// Create simulator engine with callbacks
const engine = new SimulatorEngine(
  // onReading: persist to DB + enqueue for Socket.io broadcast
  (reading) => {
    persistReading(reading)
    batchEmitter.enqueue(reading)
  },
  // onEvent: broadcast simulator events to all connected sockets
  (event) => {
    io.emit('simulator:event', event)
  }
)

// Wire engine to simulator API routes
setEngine(engine)

// Load initial patients from DB and start simulator
const db = getDb()
const activePatients = db.select().from(patients).where(eq(patients.isActive, true)).all()
engine.refreshPatients(activePatients.map(p => ({
  id: p.id,
  firstName: p.firstName,
  lastName: p.lastName,
})))
engine.start()
batchEmitter.start()
console.log(`Simulator started: ${activePatients.length} patients, tick every 5s`)

// Start data pruning schedule (prune on startup + every 6 hours)
startPruningSchedule(6)

// Auto-detect new patients every 30 seconds
setInterval(() => {
  const currentPatients = db.select().from(patients).where(eq(patients.isActive, true)).all()
  engine.refreshPatients(currentPatients.map(p => ({
    id: p.id,
    firstName: p.firstName,
    lastName: p.lastName,
  })))
}, 30_000)

// Use httpServer.listen() instead of app.listen() so Socket.io can attach
httpServer.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`)
})

export { io }
