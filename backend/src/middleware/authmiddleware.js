/**
 * Validates JWT from Authorization header and attaches decoded user to req.user.
 * Apply to all routes except /api/auth/*.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {void}
 */