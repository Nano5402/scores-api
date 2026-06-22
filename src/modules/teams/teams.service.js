const db = require('../../config/db');

exports.getAll = async ({ circuito }) => {
  let query = `
    SELECT
      pt.id,
      pt.nombre,
      pt.circuito,
      pt.imagen,
      -- Jugador 1
      p1.id           AS p1_id,
      p1.nombre       AS p1_nombre,
      p1.nombre_corto AS p1_nombre_corto,
      p1.imagen       AS p1_imagen,
      c1.code         AS p1_country_code,
      c1.nombre       AS p1_country_name,
      c1.flag         AS p1_country_flag,
      -- Jugador 2
      p2.id           AS p2_id,
      p2.nombre       AS p2_nombre,
      p2.nombre_corto AS p2_nombre_corto,
      p2.imagen       AS p2_imagen,
      c2.code         AS p2_country_code,
      c2.nombre       AS p2_country_name,
      c2.flag         AS p2_country_flag,
      -- Stats pareja
      pts.anio,
      pts.ranking,
      pts.puntos_ranking,
      pts.victorias,
      pts.derrotas
    FROM padel_teams pt
    LEFT JOIN players p1 ON p1.id = pt.player1_id
    LEFT JOIN countries c1 ON c1.id = p1.country_id
    LEFT JOIN players p2 ON p2.id = pt.player2_id
    LEFT JOIN countries c2 ON c2.id = p2.country_id
    LEFT JOIN padel_team_stats pts ON pts.team_id = pt.id
      AND pts.anio = YEAR(CURDATE())
    WHERE 1 = 1
  `;

  const params = [];

  if (circuito) {
    query += ' AND pt.circuito = ?';
    params.push(circuito);
  }

  query += ' ORDER BY COALESCE(pts.ranking, 9999) ASC, pt.nombre ASC';

  const [rows] = await db.query(query, params);
  return rows.map(formatTeam);
};

exports.getById = async (id) => {
  const [rows] = await db.query(
    `SELECT
      pt.id,
      pt.nombre,
      pt.circuito,
      pt.imagen,
      p1.id           AS p1_id,
      p1.nombre       AS p1_nombre,
      p1.nombre_corto AS p1_nombre_corto,
      p1.imagen       AS p1_imagen,
      c1.code         AS p1_country_code,
      c1.nombre       AS p1_country_name,
      c1.flag         AS p1_country_flag,
      p2.id           AS p2_id,
      p2.nombre       AS p2_nombre,
      p2.nombre_corto AS p2_nombre_corto,
      p2.imagen       AS p2_imagen,
      c2.code         AS p2_country_code,
      c2.nombre       AS p2_country_name,
      c2.flag         AS p2_country_flag,
      pts.anio,
      pts.ranking,
      pts.puntos_ranking,
      pts.victorias,
      pts.derrotas
    FROM padel_teams pt
    LEFT JOIN players p1 ON p1.id = pt.player1_id
    LEFT JOIN countries c1 ON c1.id = p1.country_id
    LEFT JOIN players p2 ON p2.id = pt.player2_id
    LEFT JOIN countries c2 ON c2.id = p2.country_id
    LEFT JOIN padel_team_stats pts ON pts.team_id = pt.id
      AND pts.anio = YEAR(CURDATE())
    WHERE pt.id = ?
    LIMIT 1`,
    [id]
  );

  if (!rows.length) {
    throw { status: 404, message: 'Pareja no encontrada' };
  }

  return formatTeam(rows[0]);
};

// ── Formateador ───────────────────────────────────────────────────────────────
function formatTeam(row) {
  return {
    id:       row.id,
    nombre:   row.nombre,
    circuito: row.circuito,
    imagen:   row.imagen || null,
    player1: {
      id:          row.p1_id,
      nombre:      row.p1_nombre,
      nombre_corto: row.p1_nombre_corto,
      imagen:      row.p1_imagen || null,
      country: {
        code: row.p1_country_code,
        name: row.p1_country_name,
        flag: row.p1_country_flag,
      },
    },
    player2: {
      id:          row.p2_id,
      nombre:      row.p2_nombre,
      nombre_corto: row.p2_nombre_corto,
      imagen:      row.p2_imagen || null,
      country: {
        code: row.p2_country_code,
        name: row.p2_country_name,
        flag: row.p2_country_flag,
      },
    },
    stats: {
      anio:           row.anio           || null,
      ranking:        row.ranking        || null,
      puntos_ranking: row.puntos_ranking || null,
      victorias:      row.victorias      || 0,
      derrotas:       row.derrotas       || 0,
    },
  };
}