const db = require('../../config/db');

exports.getAll = async ({ deporte, circuito }) => {
  let query = `
    SELECT
      p.id,
      p.nombre,
      p.nombre_corto,
      p.altura_cm,
      p.peso_kg,
      p.mano,
      p.deporte,
      p.circuito,
      p.fecha_nacimiento,
      p.imagen,
      c.code   AS country_code,
      c.nombre AS country_name,
      c.flag   AS country_flag,
      ps.anio,
      ps.ranking,
      ps.puntos_ranking,
      ps.victorias,
      ps.derrotas
    FROM players p
    LEFT JOIN countries c  ON c.id = p.country_id
    LEFT JOIN player_stats ps ON ps.player_id = p.id
      AND ps.anio = YEAR(CURDATE())
    WHERE 1 = 1
  `;

  const params = [];

  if (deporte) {
    query += ' AND p.deporte = ?';
    params.push(deporte);
  }

  if (circuito) {
    query += ' AND p.circuito = ?';
    params.push(circuito);
  }

  query += ' ORDER BY COALESCE(ps.ranking, 9999) ASC, p.nombre ASC';

  const [rows] = await db.query(query, params);

  return rows.map(formatPlayer);
};

exports.getById = async (id) => {
  const [rows] = await db.query(
    `SELECT
      p.id,
      p.nombre,
      p.nombre_corto,
      p.altura_cm,
      p.peso_kg,
      p.mano,
      p.deporte,
      p.circuito,
      p.fecha_nacimiento,
      p.imagen,
      c.code   AS country_code,
      c.nombre AS country_name,
      c.flag   AS country_flag,
      ps.anio,
      ps.ranking,
      ps.puntos_ranking,
      ps.victorias,
      ps.derrotas
    FROM players p
    LEFT JOIN countries c  ON c.id = p.country_id
    LEFT JOIN player_stats ps ON ps.player_id = p.id
      AND ps.anio = YEAR(CURDATE())
    WHERE p.id = ?
    LIMIT 1`,
    [id]
  );

  if (!rows.length) {
    throw { status: 404, message: 'Jugador no encontrado' };
  }

  return formatPlayer(rows[0]);
};

// ── Formateador ───────────────────────────────────────────────────────────────
function formatPlayer(row) {
  return {
    id:               row.id,
    nombre:           row.nombre,
    nombre_corto:     row.nombre_corto,
    fecha_nacimiento: row.fecha_nacimiento,
    imagen:           row.imagen || null,
    altura_cm:        row.altura_cm,
    peso_kg:          row.peso_kg,
    mano:             row.mano,
    deporte:          row.deporte,
    circuito:         row.circuito,
    country: {
      code: row.country_code,
      name: row.country_name,
      flag: row.country_flag,
    },
    stats: {
      anio:            row.anio          || null,
      ranking:         row.ranking       || null,
      puntos_ranking:  row.puntos_ranking || null,
      victorias:       row.victorias     || 0,
      derrotas:        row.derrotas      || 0,
    },
  };
}