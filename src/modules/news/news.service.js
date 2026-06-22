const db = require('../../config/db');

exports.getAll = async ({ deporte } = {}) => {
  let query = `
    SELECT
      id,
      titulo,
      resumen,
      categoria,
      deporte,
      imagen,
      tiempo_lec,
      publicado,
      created_at
    FROM news
    WHERE publicado = TRUE
  `;

  const params = [];

  if (deporte) {
    query += ' AND deporte = ?';
    params.push(deporte);
  }

  query += ' ORDER BY created_at DESC';

  const [rows] = await db.query(query, params);
  return rows;
};

exports.getById = async (id) => {
  const [rows] = await db.query(
    `SELECT
      id,
      titulo,
      resumen,
      contenido,
      categoria,
      deporte,
      imagen,
      tiempo_lec,
      publicado,
      created_at
    FROM news
    WHERE id = ? AND publicado = TRUE
    LIMIT 1`,
    [id]
  );

  if (!rows.length) {
    throw { status: 404, message: 'Noticia no encontrada' };
  }

  return rows[0];
};