const router         = require('express').Router();
const controller     = require('./favorites.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

// Todas las rutas de favoritos requieren autenticación
router.use(authMiddleware);

// GET    /api/favorites
router.get('/', controller.getAll);

// POST   /api/favorites          body: { tipo, referencia_id }
router.post('/', controller.add);

// DELETE /api/favorites/:tipo/:referencia_id
router.delete('/:tipo/:referencia_id', controller.remove);

module.exports = router;