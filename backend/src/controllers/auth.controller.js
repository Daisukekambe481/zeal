import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { db } from '../db/index.js'
import { users } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import { generateOTP, sendOTPEmail } from '../services/email.service.js'

/**
 * Register a new user & send OTp
 * @param {import('express').Request} req 
 * @param {import('express').Response} res
 */
export const register = async (req, res) => {
  try {
    const { email, password, full_name } = req.body

    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'email, password and full_name are required' })
    }

    const existing = await db.select().from(users).where(eq(users.email, email))
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Email already registered' })
    }

    const password_hash = await bcrypt.hash(password, 10)
    const otp = generateOTP()
    const token_expiry = new Date(Date.now() + 10 * 60 * 1000)

    const [user] = await db.insert(users).values({
      email,
      password_hash,
      full_name,
      verification_token: otp,
      token_expiry,
      otp_attempts: 0,
      is_verified: false,
    }).returning()

   // Send email in background — don't block the response
    sendOTPEmail(email, otp, 'verify').catch(err => {
      console.error('Email send failed:', err.message)
    })

    res.status(201).json({
      message: 'Registration successful. Check your email for the verification code.',
      userId: user.id,
    })
  } catch (error) {
    console.error('register error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

/**
 * Verify email using OTP code.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body

    if (!email || !otp) {
      return res.status(400).json({ error: 'email and otp are required' })
    }

    const [user] = await db.select().from(users).where(eq(users.email, email))

    if (!user) return res.status(404).json({ error: 'User not found' })
    if (user.is_verified) return res.status(400).json({ error: 'Email already verified' })

    if (user.otp_attempts >= 3) {
      return res.status(429).json({
        error: 'Too many incorrect attempts. Please request a new verification code.'
      })
    }

    if (user.verification_token !== otp) {
      await db.update(users)
        .set({ otp_attempts: (user.otp_attempts || 0) + 1 })
        .where(eq(users.email, email))
      const remaining = 2 - (user.otp_attempts || 0)
      return res.status(400).json({
        error: `Invalid OTP. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`
      })
    }

    if (new Date() > new Date(user.token_expiry)) {
      return res.status(400).json({ error: 'OTP expired' })
    }

    await db.update(users)
      .set({ is_verified: true, verification_token: null, token_expiry: null, otp_attempts: 0 })
      .where(eq(users.email, email))

    res.status(200).json({ message: 'Email verified successfully' })
  } catch (error) {
    console.error('verifyEmail error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

/**
 * Log in a verified user and return JWT tokens.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' })
    }

    const [user] = await db.select().from(users).where(eq(users.email, email))

    if (!user) return res.status(401).json({ error: 'Invalid credentials' })

    if (!user.is_verified) {
      return res.status(403).json({ error: 'Please verify your email before logging in' })
    }

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' })

    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    )

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    )

    await db.update(users)
      .set({ refresh_token: refreshToken, last_login: new Date() })
      .where(eq(users.id, user.id))

    res.status(200).json({ accessToken, refreshToken })
  } catch (error) {
    console.error('login error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

/**
 * Issue a new access token
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(400).json({ error: 'refreshToken is required' })
    }

    let decoded
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
    } catch {
      return res.status(403).json({ error: 'Invalid or expired refresh token' })
    }

    const [user] = await db.select().from(users).where(eq(users.id, decoded.id))
    if (!user || user.refresh_token !== refreshToken) {
      return res.status(403).json({ error: 'Refresh token revoked' })
    }

    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    )

    res.status(200).json({ accessToken })
  } catch (error) {
    console.error('refresh error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

/**
 * Send OTP to email for password reset.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) return res.status(400).json({ error: 'email is required' })

    const [user] = await db.select().from(users).where(eq(users.email, email))

    if (!user) {
      return res.status(200).json({ message: 'If that email exists, an OTP has been sent.' })
    }

    const otp = generateOTP()
    const token_expiry = new Date(Date.now() + 10 * 60 * 1000)

    await db.update(users)
      .set({ verification_token: otp, token_expiry, otp_attempts: 0 })
      .where(eq(users.email, email))

   sendOTPEmail(email, otp, 'reset').catch(err => {
      console.error('Email send failed:', err.message)
    })

    res.status(200).json({ message: 'If that email exists, an OTP has been sent.' })
  } catch (error) {
    console.error('forgotPassword error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

/**
 * Verify reset OTP
 * @param {import('express').Request} req 
 * @param {import('express').Response} res
 */
export const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body

    if (!email || !otp) {
      return res.status(400).json({ error: 'email and otp are required' })
    }

    const [user] = await db.select().from(users).where(eq(users.email, email))
    if (!user) return res.status(404).json({ error: 'User not found' })

    if (user.otp_attempts >= 3) {
      return res.status(429).json({
        error: 'Too many incorrect attempts. Please request a new reset code.'
      })
    }

    if (user.verification_token !== otp) {
      await db.update(users)
        .set({ otp_attempts: (user.otp_attempts || 0) + 1 })
        .where(eq(users.email, email))
      const remaining = 2 - (user.otp_attempts || 0)
      return res.status(400).json({
        error: `Invalid OTP. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`
      })
    }

    if (new Date() > new Date(user.token_expiry)) {
      return res.status(400).json({ error: 'OTP expired. Please request a new one.' })
    }

    await db.update(users)
      .set({ otp_attempts: 0 })
      .where(eq(users.email, email))

    res.status(200).json({ message: 'OTP verified. You may now reset your password.' })
  } catch (error) {
    console.error('verifyResetOtp error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

/**
 * Reset password using OTP code.
 * @param {import('express').Request} req -
 * @param {import('express').Response} res
 */
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: 'email, otp and newPassword are required' })
    }

    const [user] = await db.select().from(users).where(eq(users.email, email))
    if (!user) return res.status(404).json({ error: 'User not found' })

    if (user.verification_token !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' })
    }

    if (new Date() > new Date(user.token_expiry)) {
      return res.status(400).json({ error: 'OTP expired' })
    }

    const password_hash = await bcrypt.hash(newPassword, 10)

    await db.update(users)
      .set({ password_hash, verification_token: null, token_expiry: null, otp_attempts: 0 })
      .where(eq(users.email, email))

    res.status(200).json({ message: 'Password reset successful' })
  } catch (error) {
    console.error('resetPassword error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

/**
 * Logout
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const logout = async (req, res) => {
  try {
    const userId = req.user.id
    const token  = req.headers.authorization?.split(' ')[1]

    const [user] = await db.select().from(users).where(eq(users.id, userId))

    const blacklist = user.blacklisted_tokens || []
    if (token && !blacklist.includes(token)) {
      blacklist.push(token)
    }

    await db.update(users)
      .set({ refresh_token: null, blacklisted_tokens: blacklist })
      .where(eq(users.id, userId))

    res.status(200).json({ message: 'Logged out successfully' })
  } catch (error) {
    console.error('logout error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}