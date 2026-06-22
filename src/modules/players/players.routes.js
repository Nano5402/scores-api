const router         = require('express').Router();
const controller     = require('./players.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

// GET /api/players?deporte=tenis&circuito=ATP
router.get('/', authMiddleware, controller.getAll);

// GET /api/players/:id
router.get('/:id', authMiddleware, controller.getById);

module.exports = router;