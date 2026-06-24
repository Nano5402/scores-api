const service = require('./sedes.service');
const { success, error } = require('../../utils/response');

// ── List all sedes ──────
exports.getAll = async (req, res) => {
  try {
    const data = await service.getAll();
    return success(res, data);
  } catch (err) {
    return error(res, err.message || 'Error al obtener sedes', err.status || 500);
  }
};

// ── List canchas for a sede ──────
exports.getCanchasBySede = async (req, res) => {
  try {
    const data = await service.getCanchasBySede(req.params.id);
    return success(res, data);
  } catch (err) {
    return error(res, err.message || 'Error al obtener canchas', err.status || 500);
  }
};
