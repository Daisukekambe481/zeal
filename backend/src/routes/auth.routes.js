import { passwordStrength } from '../middleware/passwordStrength.js'
import { Router } from 'express'
import {
  register,
  verifyEmail,
  login,
  refresh,
  forgotPassword,
  resetPassword,
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

export default router