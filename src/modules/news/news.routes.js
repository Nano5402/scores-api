const router         = require('express').Router();
const controller     = require('./news.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

// GET /api/news?deporte=tenis
router.get('/',    authMiddleware, controller.getAll);

// GET /api/news/:id
router.get('/:id', authMiddleware, controller.getById);

module.exports = router;