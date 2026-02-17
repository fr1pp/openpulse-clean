import { sql } from 'drizzle-orm'
import { initDb, getDb } from './connection.js'
import { patients, healthcarePros } from './schema.js'
import type { InsertPatient, InsertHealthcarePro } from './schema.js'
import { config } from '../lib/config.js'

// 6 patients with distinct ages, conditions, and risk profiles
const SEED_PATIENTS: InsertPatient[] = [
  {
    firstName: 'Margaret',
    lastName: 'Thompson',
    dateOfBirth: '1941-03-15',
    gender: 'female',
    accessCode: 'MT85',
    qrCodeData: '/portal/login?code=MT85',
    roomNumber: '101',
    primaryCondition: 'Hypertension, mild COPD',
    notes: 'Elevated BP baseline, lower SpO2 typical for age and COPD',
  },
  {
    firstName: 'Robert',
    lastName: 'Chen',
    dateOfBirth: '1955-08-22',
    gender: 'male',
    accessCode: 'RC71',
    qrCodeData: '/portal/login?code=RC71',
    roomNumber: '102',
    primaryCondition: 'Well-controlled type 2 diabetes',
    notes: 'Generally healthy vitals, occasional mild hypoglycemia episodes',
  },
  {
    firstName: 'Dorothy',
    lastName: 'Williams',
    dateOfBirth: '1933-11-08',
    gender: 'female',
    accessCode: 'DW92',
    qrCodeData: '/portal/login?code=DW92',
    roomNumber: '103',
    primaryCondition: 'Atrial fibrillation, osteoporosis',
    notes: 'Irregular heart rate baseline due to AF, lower resting BP',
  },
  {
    firstName: 'James',
    lastName: "O'Brien",
    dateOfBirth: '1948-06-30',
    gender: 'male',
    accessCode: 'JO78',
    qrCodeData: '/portal/login?code=JO78',
    roomNumber: '104',
    primaryCondition: 'Congestive heart failure (stable)',
    notes: 'Higher resting HR, slightly lower SpO2, closely monitored',
  },
  {
    firstName: 'Evelyn',
    lastName: 'Kowalski',
    dateOfBirth: '1950-01-19',
    gender: 'female',
    accessCode: 'EK76',
    qrCodeData: '/portal/login?code=EK76',
    roomNumber: '105',
    primaryCondition: 'Hypothyroidism',
    notes: 'Lower resting HR and temperature baseline typical of hypothyroidism',
  },
  {
    firstName: 'Arthur',
    lastName: 'Patel',
    dateOfBirth: '1944-09-12',
    gender: 'male',
    accessCode: 'AP81',
    qrCodeData: '/portal/login?code=AP81',
    roomNumber: '106',
    primaryCondition: 'Post-stroke recovery, hypertension',
    notes: 'Elevated BP baseline, occasional temperature fluctuations',
  },
]

// 1 healthcare professional for development/testing
const SEED_HEALTHCARE_PRO: InsertHealthcarePro = {
  email: 'admin@openpulse.dev',
  // bcrypt hash of 'password123' with cost factor 12
  passwordHash: '$2a$12$LJ3m4ys3GZfnMRqzON/bbeYQLkHMGSjWLdHavzSEBVhFdPn/SxKKe',
  firstName: 'Sarah',
  lastName: 'Mitchell',
  role: 'nurse',
}

export async function seed() {
  const db = getDb()

  // Check if patients table already has data (idempotent)
  const existingPatients = db.select({ count: sql<number>`COUNT(*)` }).from(patients).get()
  if (existingPatients && existingPatients.count > 0) {
    console.log(`Seed skipped: ${existingPatients.count} patients already exist`)
    return
  }

  // Insert all 6 patients
  db.insert(patients).values(SEED_PATIENTS).run()
  console.log(`Seeded ${SEED_PATIENTS.length} patients`)

  // Insert healthcare pro
  db.insert(healthcarePros).values(SEED_HEALTHCARE_PRO).run()
  console.log(`Seeded 1 healthcare professional (${SEED_HEALTHCARE_PRO.email})`)
}

// Run directly as a script
const isDirectRun = process.argv[1]?.includes('seed')
if (isDirectRun) {
  initDb(config.dbPath)
  await seed()
  console.log('Seed complete')
}
