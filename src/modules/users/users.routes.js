const router = require('express').Router()
const controller = require('./users.controller')
const { requireAuth, requireAdmin } = require('../../middlewares/auth.middleware')

// Rutas del propio usuario — primero, para que /me no choque con /:id
router.get('/me', requireAuth, controller.getMe)
router.put('/me', requireAuth, controller.updateMe)
router.put('/me/password', requireAuth, controller.changePassword)

// Rutas de administración
router.get('/', requireAuth, requireAdmin, controller.getAll)
router.get('/:id', requireAuth, requireAdmin, controller.getById)
router.put('/:id/rol', requireAuth, requireAdmin, controller.updateRole)

module.exports = router
