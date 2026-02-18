import { sql } from 'drizzle-orm'
import { sqliteTable, text, integer, real, uniqueIndex, index } from 'drizzle-orm/sqlite-core'

// ============================================================
// Patients
// ============================================================
export const patients = sqliteTable('patients', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  dateOfBirth: text('date_of_birth').notNull(),
  gender: text('gender').notNull(),
  accessCode: text('access_code').notNull().unique(),
  qrCodeData: text('qr_code_data'),
  primaryCondition: text('primary_condition'),
  notes: text('notes'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text('updated_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
}, (table) => [
  uniqueIndex('access_code_idx').on(table.accessCode),
])

// ============================================================
// Healthcare Professionals
// ============================================================
export const healthcarePros = sqliteTable('healthcare_pros', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  role: text('role').notNull().default('pro'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text('updated_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
}, (table) => [
  uniqueIndex('email_idx').on(table.email),
])

// ============================================================
// Vital Readings
// ============================================================
export const vitalReadings = sqliteTable('vital_readings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  patientId: integer('patient_id').notNull().references(() => patients.id, { onDelete: 'cascade' }),
  heartRate: integer('heart_rate'),
  bpSystolic: integer('bp_systolic'),
  bpDiastolic: integer('bp_diastolic'),
  spo2: real('spo2'),
  temperature: real('temperature'),
  isAnomaly: integer('is_anomaly', { mode: 'boolean' }).notNull().default(false),
  recordedAt: text('recorded_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
}, (table) => [
  index('vital_patient_idx').on(table.patientId),
  index('vital_recorded_at_idx').on(table.recordedAt),
  index('vital_patient_time_idx').on(table.patientId, table.recordedAt),
])

// ============================================================
// Type exports (inferred from schema)
// ============================================================
export type Patient = typeof patients.$inferSelect
export type InsertPatient = typeof patients.$inferInsert
export type HealthcarePro = typeof healthcarePros.$inferSelect
export type InsertHealthcarePro = typeof healthcarePros.$inferInsert
export type VitalReading = typeof vitalReadings.$inferSelect
export type InsertVitalReading = typeof vitalReadings.$inferInsert
