const matchesService     = require('./matches.service');
const { success, error } = require('../../utils/response');

exports.getAll = async (req, res) => {
  try {
    const { estado, deporte, torneo_id } = req.query;
    const data = await matchesService.getAll({ estado, deporte, torneo_id });
    return success(res, data);
  } catch (err) {
    return error(res, err.message || 'Error al obtener partidos', err.status || 500);
  }
};

exports.getById = async (req, res) => {
  try {
    const data = await matchesService.getById(req.params.id);
    return success(res, data);
  } catch (err) {
    return error(res, err.message || 'Error al obtener partido', err.status || 500);
  }
};