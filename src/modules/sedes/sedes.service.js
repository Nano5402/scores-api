const db = require('../../config/db');

exports.getAll = async () => {
  const [rows] = await db.query(
    'SELECT id, nombre, direccion, ciudad FROM sedes WHERE activa = TRUE ORDER BY nombre ASC'
  );
  return rows;
};

exports.getCanchasBySede = async (sedeId) => {
  const [sede] = await db.query('SELECT id FROM sedes WHERE id = ? AND activa = TRUE', [sedeId]);
  if (!sede.length) throw { status: 404, message: 'Sede no encontrada' };

  const [rows] = await db.query(
    `SELECT id, nombre, deporte, superficie
     FROM canchas
     WHERE sede_id = ? AND activa = TRUE
     ORDER BY nombre ASC`,
    [sedeId]
  );
  return rows;
};