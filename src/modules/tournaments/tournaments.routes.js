const router         = require('express').Router();
const controller     = require('./tournaments.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

// GET /api/tournaments?deporte=tenis&estado=live
router.get('/', authMiddleware, controller.getAll);

// GET /api/tournaments/:id
router.get('/:id', authMiddleware, controller.getById);

module.exports = router;