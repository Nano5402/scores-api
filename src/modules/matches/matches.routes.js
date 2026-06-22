const router         = require('express').Router();
const controller     = require('./matches.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

// GET /api/matches?estado=live&deporte=tenis&torneo_id=1
router.get('/',    authMiddleware, controller.getAll);

// GET /api/matches/:id
router.get('/:id', authMiddleware, controller.getById);

module.exports = router;