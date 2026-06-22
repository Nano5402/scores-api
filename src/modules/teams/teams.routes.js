const router         = require('express').Router();
const controller     = require('./teams.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

// GET /api/teams?circuito=Premier+Padel
router.get('/', authMiddleware, controller.getAll);

// GET /api/teams/:id
router.get('/:id', authMiddleware, controller.getById);

module.exports = router;