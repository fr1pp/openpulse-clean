import jwt from 'jsonwebtoken'
import type { Request, Response, NextFunction } from 'express'
import { config } from '../lib/config.js'

export interface AuthPayload {
  sub: number
  role: 'healthcare_pro' | 'patient'
  email?: string
  accessCode?: string
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.token
  if (!token) {
    res.status(401).json({ error: 'Authentication required' })
    return
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as unknown as AuthPayload
    req.user = decoded
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
    return
  }
}

export function requireRole(role: 'healthcare_pro' | 'patient') {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role !== role) {
      res.status(403).json({ error: 'Forbidden' })
      return
    }
    next()
  }
}
