import { passwordStrength } from '../middleware/passwordStrength.js'
import { Router } from 'express'
import { authMiddleware } from '/middleware/authMiddleware.js'
import {
  register,
  verifyEmail,
  login,
  refresh,
  verifyResetOtp,
  forgotPassword,
  resetPassword,
  logout,
} from '../controllers/auth.controller.js'
import {
  loginLimiter,
  otpLimiter,
  registerLimiter,
} from '../middleware/rateLimiter.js'
const router = Router()

router.post('/register',registerLimiter, passwordStrength, register)
router.post('/verify-email',otpLimiter,verifyEmail)
router.post('/login',loginLimiter,login)
router.post('/refresh',refresh)
router.post('/forgot-password',otpLimiter,forgotPassword)
router.post('/reset-password',  otpLimiter,passwordStrength,resetPassword)
router.post('/verify-reset-otp', otpLimiter, verifyResetOtp)
router.post('/logout', authMiddleware, logout)
export default router