const tournamentsService = require('./tournaments.service');
const { success, error } = require('../../utils/response');

exports.getAll = async (req, res) => {
  try {
    const { deporte, estado } = req.query;
    const data = await tournamentsService.getAll({ deporte, estado });
    return success(res, data);
  } catch (err) {
    return error(res, err.message || 'Error al obtener torneos', err.status || 500);
  }
};

exports.getById = async (req, res) => {
  try {
    const data = await tournamentsService.getById(req.params.id);
    return success(res, data);
  } catch (err) {
    return error(res, err.message || 'Error al obtener torneo', err.status || 500);
  }
};