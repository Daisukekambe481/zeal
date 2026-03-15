import nodemailer from 'nodemailer'

/**
 * Nodemailer transporter using Gmail SMTP.
 * Credentials loaded from environment variables.
 */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
  connectionTimeout: 5000,
  greetingTimeout: 5000,
  socketTimeout: 5000,

})

/**
 * Generate a 6-digit OTP.
 * @returns {string}
 */
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Send OTP email for verification or password reset.
 * @param {string} to - Recipient email address
 * @param {string} otp - 6-digit OTP code
 * @param {'verify'|'reset'} type - Purpose of the OTP
 * @returns {Promise<void>}
 */
export const sendOTPEmail = async (to, otp, type) => {
  const subject = type === 'verify'
    ? 'Verify your Zeal account'
    : 'Reset your Zeal password'

  const message = type === 'verify'
    ? `Your verification code is: ${otp}\n\nThis code expires in 10 minutes.`
    : `Your password reset code is: ${otp}\n\nThis code expires in 10 minutes.`

  await transporter.sendMail({
    from: `"Zeal" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    text: message,
  })
}