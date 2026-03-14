import rateLimit from 'express-rate-limit'

/**
  5 attempts per 15 minutes per IP.
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many login attempts. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
})

/**
 5 attempts per 10 minutes per IP.
 */
export const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: { error: 'Too many OTP attempts. Try again in 10 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
})


export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: 'Too many accounts created. Try again in an hour.' },
  standardHeaders: true,
  legacyHeaders: false,
})