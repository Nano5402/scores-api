const db = require('../../config/db');

exports.getAll = async ({ deporte, estado }) => {
  let query = `
    SELECT
      t.id,
      t.nombre,
      t.deporte,
      t.circuito,
      t.superficie,
      t.estado,
      t.fecha_inicio,
      t.fecha_fin,
      t.imagen,
      t.prize_money,
      c.code   AS country_code,
      c.nombre AS country_name,
      c.flag   AS country_flag
    FROM tournaments t
    LEFT JOIN countries c ON c.id = t.country_id
    WHERE 1 = 1
  `;

  const params = [];

  if (deporte) {
    query += ' AND t.deporte = ?';
    params.push(deporte);
  }

  if (estado) {
    query += ' AND t.estado = ?';
    params.push(estado);
  }

  query += ' ORDER BY t.fecha_inicio DESC';

  const [rows] = await db.query(query, params);
  return rows.map(formatTournament);
};

exports.getById = async (id) => {
  const [rows] = await db.query(
    `SELECT
      t.id,
      t.nombre,
      t.deporte,
      t.circuito,
      t.superficie,
      t.estado,
      t.fecha_inicio,
      t.fecha_fin,
      t.imagen,
      t.prize_money,
      c.code   AS country_code,
      c.nombre AS country_name,
      c.flag   AS country_flag
    FROM tournaments t
    LEFT JOIN countries c ON c.id = t.country_id
    WHERE t.id = ?
    LIMIT 1`,
    [id]
  );

  if (!rows.length) {
    throw { status: 404, message: 'Torneo no encontrado' };
  }

  return formatTournament(rows[0]);
};

// ── Formateador ───────────────────────────────────────────────────────────────
function formatTournament(row) {
  return {
    id:           row.id,
    nombre:       row.nombre,
    deporte:      row.deporte,
    circuito:     row.circuito,
    superficie:   row.superficie,
    estado:       row.estado,
    fecha_inicio: row.fecha_inicio,
    fecha_fin:    row.fecha_fin,
    imagen:       row.imagen || null,
    prize_money:  row.prize_money || null,
    country: {
      code: row.country_code,
      name: row.country_name,
      flag: row.country_flag,
    },
  };
}