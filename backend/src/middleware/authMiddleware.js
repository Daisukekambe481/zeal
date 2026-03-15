import jwt from 'jsonwebtoken'
import { db } from '../db/index.js'
import { users } from '../db/schema.js'
import { eq } from 'drizzle-orm'

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {void}
 */
export const authMiddleware = async (req, res, next) => {
  const header = req.headers.authorization
  if (!header) return res.status(401).json({ error: 'No token provided' })

  const token = header.split(' ')[1]

  let decoded
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }

  const [user] = await db.select().from(users).where(eq(users.id, decoded.id))
  if (!user) return res.status(401).json({ error: 'User not found' })

  if (user.blacklisted_tokens && user.blacklisted_tokens.includes(token)) {
    return res.status(401).json({ error: 'Token has been revoked. Please log in again.' })
  }

  req.user = decoded
  next()
}