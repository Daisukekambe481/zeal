
import { Router } from 'express'
import {
  register,
  verifyEmail,
  login,
  refresh,
  forgotPassword,
  resetPassword,
} from '../controllers/auth.controller.js'

const router = Router()

router.post('/register', register)
router.post('/verify-email', verifyEmail)
router.post('/login', login)
router.post('/refresh', refresh)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)

export default router