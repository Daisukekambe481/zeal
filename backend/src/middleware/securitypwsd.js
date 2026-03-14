
/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const passwordStrength = (req, res, next) => {
  const password = req.body.password || req.body.newPassword

  if (!password) {
    return res.status(400).json({ error: 'Password is required.' })
  }

  const errors = []

  // ── LENGTH ──
  if (password.length < 10) {
    errors.push('at least 10 characters')
  }
  if (password.length > 128) {
    return res.status(400).json({ error: 'Password too long.' })
  }

  // ── CHARACTER CLASSES ──
  if (!/[A-Z]/.test(password))           errors.push('one uppercase letter (A-Z)')
  if (!/[a-z]/.test(password))           errors.push('one lowercase letter (a-z)')
  if (!/[0-9]/.test(password))           errors.push('one number (0-9)')
  if (!/[^A-Za-z0-9]/.test(password))   errors.push('one special character (!@#$%...)')

  // ── COMMON PASSWORDS BLOCKLIST ──
  const common = [
    'password', 'password1', 'password123', '123456789', '1234567890',
    'qwerty123', 'iloveyou', 'admin1234', 'welcome1', 'monkey123',
    'dragon123', 'master123', 'letmein1', 'sunshine1', 'princess1',
    'football', 'shadow123', 'superman', 'michael1', 'charlie1',
  ]
  if (common.includes(password.toLowerCase())) {
    errors.push('password is too common — choose something unique')
  }

  // ── SEQUENTIAL PATTERNS ──
  const sequential = ['abcdefgh', 'qwertyui', '12345678', '87654321', 'zxcvbnm']
  const lower = password.toLowerCase()
  if (sequential.some(seq => lower.includes(seq))) {
    errors.push('no sequential patterns (abc..., qwerty..., 12345...)')
  }

  // ── REPEATED CHARACTERS ──
  if (/(.)\1{3,}/.test(password)) {
    errors.push('no more than 3 repeated characters in a row (aaaa, 1111...)')
  }

  // ── ENTROPY CHECK ──
  const entropy = calculateEntropy(password)
  if (entropy < 40) {
    errors.push('password is too predictable — mix more character types')
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Password too weak.',
      requirements: errors,
    })
  }

  next()
}

/**
 * Calculate Shannon entropy of a password.
 * Higher = more random = stronger.
 * @param {string} str
 * @returns {number} entropy in bits
 */
function calculateEntropy(str) {
  const freq = {}
  for (const ch of str) freq[ch] = (freq[ch] || 0) + 1
  const len = str.length
  return Object.values(freq).reduce((sum, count) => {
    const p = count / len
    return sum - p * Math.log2(p)
  }, 0) * len / 4
}