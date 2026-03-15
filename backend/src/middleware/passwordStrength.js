import zxcvbn from 'zxcvbn'

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

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' })
  }

  if (password.length > 128) {
    return res.status(400).json({ error: 'Password too long.' })
  }

  const result = zxcvbn(password)

  if (result.score < 3) {
    return res.status(400).json({
      error: 'Password too weak.',
      feedback: result.feedback.suggestions.length > 0
        ? result.feedback.suggestions
        : ['Try a longer password or mix letters, numbers and symbols.'],
      score: result.score,
    })
  }

  next()
}