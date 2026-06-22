const teamsService   = require('./teams.service');
const { success, error } = require('../../utils/response');

exports.getAll = async (req, res) => {
  try {
    const { circuito } = req.query;
    const data = await teamsService.getAll({ circuito });
    return success(res, data);
  } catch (err) {
    return error(res, err.message || 'Error al obtener parejas', err.status || 500);
  }
};

exports.getById = async (req, res) => {
  try {
    const data = await teamsService.getById(req.params.id);
    return success(res, data);
  } catch (err) {
    return error(res, err.message || 'Error al obtener pareja', err.status || 500);
  }
};