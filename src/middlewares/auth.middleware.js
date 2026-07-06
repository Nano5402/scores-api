const jwt = require('jsonwebtoken')
const { error } = require('../utils/response')

/**
 * Middleware que verifica el Bearer token JWT en el header Authorization.
 * Si es válido, adjunta el payload decodificado a req.user.
 */
exports.requireAuth = (req, res, next) => {
  const authHeader = req.headers['authorization']

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return error(res, 'Token de acceso requerido', 401)
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return error(res, 'Token expirado', 401)
    }
    return error(res, 'Token inválido', 401)
  }
}

/**
 * Middleware que verifica que el usuario autenticado tenga rol 'admin'.
 * Debe usarse DESPUÉS de requireAuth.
 */
exports.requireAdmin = (req, res, next) => {
  if (req.user.rol !== 'admin') {
    return error(res, 'Acceso restringido a administradores', 403)
  }
  next()
}
