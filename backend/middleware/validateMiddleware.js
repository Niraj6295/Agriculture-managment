/**
 * Lightweight request validator.
 * Usage:  validate(['email','password'])
 * Returns 400 with a clear message if any required field is missing or empty.
 */
const validate = (fields) => (req, res, next) => {
  const missing = fields.filter(f => {
    const val = req.body[f];
    return val === undefined || val === null || (typeof val === 'string' && val.trim() === '');
  });
  if (missing.length) {
    return res.status(400).json({
      success: false,
      message: `Missing required field${missing.length > 1 ? 's' : ''}: ${missing.join(', ')}`,
    });
  }
  next();
};

/**
 * Sanitise string fields in req.body to trim whitespace.
 */
const sanitize = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    for (const key of Object.keys(req.body)) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    }
  }
  next();
};

module.exports = { validate, sanitize };
