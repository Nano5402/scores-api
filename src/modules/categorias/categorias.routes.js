const router = require('express').Router();
const controller = require('./categorias.controller');
const { requireAuth } = require('../../middlewares/auth.middleware');

// ── Routes ──────
router.get('/', requireAuth, controller.getAll);

module.exports = router;
