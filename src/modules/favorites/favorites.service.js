const db = require('../../config/db');

exports.getAll = async (user_id) => {
  const [rows] = await db.query(
    `SELECT id, tipo, referencia_id, created_at
     FROM favorites
     WHERE user_id = ?
     ORDER BY created_at DESC`,
    [user_id]
  );
  return rows;
};

exports.add = async (user_id, { tipo, referencia_id }) => {
  // Verificar si ya existe
  const [existing] = await db.query(
    `SELECT id FROM favorites
     WHERE user_id = ? AND tipo = ? AND referencia_id = ?`,
    [user_id, tipo, referencia_id]
  );

  if (existing.length) {
    throw { status: 409, message: 'Este favorito ya existe' };
  }

  const [result] = await db.query(
    `INSERT INTO favorites (user_id, tipo, referencia_id)
     VALUES (?, ?, ?)`,
    [user_id, tipo, referencia_id]
  );

  return {
    id:            result.insertId,
    user_id,
    tipo,
    referencia_id,
  };
};

exports.remove = async (user_id, { tipo, referencia_id }) => {
  const [result] = await db.query(
    `DELETE FROM favorites
     WHERE user_id = ? AND tipo = ? AND referencia_id = ?`,
    [user_id, tipo, referencia_id]
  );

  if (result.affectedRows === 0) {
    throw { status: 404, message: 'Favorito no encontrado' };
  }

  return { message: 'Favorito eliminado correctamente' };
};