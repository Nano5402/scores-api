const playersService = require('./players.service');
const { success, error } = require('../../utils/response');

exports.getAll = async (req, res) => {
  try {
    const { deporte, circuito } = req.query;
    const data = await playersService.getAll({ deporte, circuito });
    return success(res, data);
  } catch (err) {
    return error(res, err.message || 'Error al obtener jugadores', err.status || 500);
  }
};

exports.getById = async (req, res) => {
  try {
    const data = await playersService.getById(req.params.id);
    return success(res, data);
  } catch (err) {
    return error(res, err.message || 'Error al obtener jugador', err.status || 500);
  }
};