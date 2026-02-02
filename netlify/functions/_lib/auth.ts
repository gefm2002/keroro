import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

// JWT_SECRET: usar el que esté configurado, o un valor por defecto (no seguro para producción)
const JWT_SECRET = process.env.JWT_SECRET || process.env.VITE_SUPABASE_ANON_KEY?.substring(0, 32) || 'keroro-store-default-secret-key-2024'

export interface TokenPayload {
  userId: string
  email: string
  role: string
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload
  } catch {
    return null
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function getAuthTokenFromEvent(event: any): string | null {
  // Netlify Functions: event.headers puede ser objeto con keys case-insensitive
  if (!event.headers) {
    return null
  }

  // Buscar authorization en diferentes formatos
  const authHeader = 
    event.headers.authorization || 
    event.headers.Authorization ||
    event.headers.AUTHORIZATION ||
    (event.multiValueHeaders?.authorization?.[0]) ||
    (event.multiValueHeaders?.Authorization?.[0])

  if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim()
  }
  
  return null
}

export function requireAuth(event: any): TokenPayload {
  const token = getAuthTokenFromEvent(event)
  
  if (!token) {
    console.error('No se encontró token en headers:', event.headers)
    throw new Error('No autorizado: token faltante')
  }
  
  const payload = verifyToken(token)
  if (!payload) {
    console.error('Token inválido o expirado')
    throw new Error('Token inválido o expirado')
  }
  
  return payload
}
