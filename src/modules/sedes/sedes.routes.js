const router = require('express').Router();
const controller = require('./sedes.controller');
const { requireAuth } = require('../../middlewares/auth.middleware');

// ── Routes ──────
router.get('/', requireAuth, controller.getAll);
router.get('/:id/canchas', requireAuth, controller.getCanchasBySede);

module.exports = router;
