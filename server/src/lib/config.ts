import type { CookieOptions } from 'express'

const isProd = process.env.NODE_ENV === 'production'

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  dbPath: process.env.DB_PATH || './openpulse.db',
  jwtSecret: process.env.JWT_SECRET || 'openpulse-dev-secret-change-in-prod',
  cookieOptions: {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  } satisfies CookieOptions,
}
