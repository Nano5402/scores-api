const service = require('./categorias.service');
const { success, error } = require('../../utils/response');

// ── List all categorias ──────
exports.getAll = async (req, res) => {
  try {
    const filters = {};
    if (req.query.deporte) filters.deporte = req.query.deporte;

    const data = await service.getAll(filters);
    return success(res, data);
  } catch (err) {
    return error(res, err.message || 'Error al obtener categorías', err.status || 500);
  }
};
