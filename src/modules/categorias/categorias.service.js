const db = require('../../config/db');

exports.getAll = async ({ deporte } = {}) => {
  let sql = 'SELECT id, nombre, deporte, orden FROM categorias WHERE 1 = 1';
  const params = [];
  if (deporte) { sql += ' AND (deporte = ? OR deporte = "ambos")'; params.push(deporte); }
  sql += ' ORDER BY orden ASC, nombre ASC';
  const [rows] = await db.query(sql, params);
  return rows;
};

exports.getById = async (id) => {
  const [rows] = await db.query('SELECT id, nombre, deporte, orden FROM categorias WHERE id = ? LIMIT 1', [id]);
  if (!rows.length) throw { status: 404, message: 'Categoría no encontrada' };
  return rows[0];
};