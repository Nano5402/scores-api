const newsService        = require('./news.service');
const { success, error } = require('../../utils/response');

exports.getAll = async (req, res) => {
  try {
    const { deporte } = req.query;
    const data = await newsService.getAll({ deporte });
    return success(res, data);
  } catch (err) {
    return error(res, err.message || 'Error al obtener noticias', err.status || 500);
  }
};

exports.getById = async (req, res) => {
  try {
    const data = await newsService.getById(req.params.id);
    return success(res, data);
  } catch (err) {
    return error(res, err.message || 'Error al obtener noticia', err.status || 500);
  }
};