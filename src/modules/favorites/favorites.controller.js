const favoritesService   = require('./favorites.service');
const { success, error } = require('../../utils/response');

// GET /api/favorites — todos los favoritos del usuario autenticado
exports.getAll = async (req, res) => {
  try {
    const data = await favoritesService.getAll(req.user.id);
    return success(res, data);
  } catch (err) {
    return error(res, err.message || 'Error al obtener favoritos', err.status || 500);
  }
};

// POST /api/favorites — agregar favorito { tipo, referencia_id }
exports.add = async (req, res) => {
  try {
    const { tipo, referencia_id } = req.body;

    if (!tipo || !referencia_id) {
      return error(res, 'tipo y referencia_id son requeridos', 400);
    }

    const tiposValidos = ['player', 'team', 'match', 'tournament'];
    if (!tiposValidos.includes(tipo)) {
      return error(res, `tipo debe ser uno de: ${tiposValidos.join(', ')}`, 400);
    }

    const data = await favoritesService.add(req.user.id, { tipo, referencia_id });
    return success(res, data, 201);
  } catch (err) {
    return error(res, err.message || 'Error al agregar favorito', err.status || 500);
  }
};

// DELETE /api/favorites/:tipo/:referencia_id — eliminar favorito
exports.remove = async (req, res) => {
  try {
    const { tipo, referencia_id } = req.params;
    const data = await favoritesService.remove(req.user.id, { tipo, referencia_id });
    return success(res, data);
  } catch (err) {
    return error(res, err.message || 'Error al eliminar favorito', err.status || 500);
  }
};