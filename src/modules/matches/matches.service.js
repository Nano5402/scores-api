const db = require('../../config/db');

exports.getAll = async ({ estado, deporte, torneo_id }) => {
  let query = `
    SELECT
      m.id,
      m.deporte,
      m.ronda,
      m.estado,
      m.ganador,
      m.duracion_min,
      m.fecha_inicio,
      m.superficie,
      m.pista,
      -- Torneo
      t.id     AS torneo_id,
      t.nombre AS torneo_nombre,
      tc.flag  AS torneo_flag,
      -- Tenis: player1
      p1.id           AS p1_id,
      p1.nombre_corto AS p1_nombre_corto,
      p1c.flag        AS p1_flag,
      ps1.ranking     AS p1_ranking,
      -- Tenis: player2
      p2.id           AS p2_id,
      p2.nombre_corto AS p2_nombre_corto,
      p2c.flag        AS p2_flag,
      ps2.ranking     AS p2_ranking,
      -- Pádel: team1
      pt1.id     AS team1_id,
      pt1.nombre AS team1_nombre,
      -- Pádel: team2
      pt2.id     AS team2_id,
      pt2.nombre AS team2_nombre
    FROM matches m
    LEFT JOIN tournaments t   ON t.id  = m.tournament_id
    LEFT JOIN countries   tc  ON tc.id = t.country_id
    -- Tenis
    LEFT JOIN players p1      ON p1.id = m.player1_id
    LEFT JOIN countries p1c   ON p1c.id = p1.country_id
    LEFT JOIN player_stats ps1 ON ps1.player_id = p1.id AND ps1.temporada = YEAR(CURDATE())
    LEFT JOIN players p2      ON p2.id = m.player2_id
    LEFT JOIN countries p2c   ON p2c.id = p2.country_id
    LEFT JOIN player_stats ps2 ON ps2.player_id = p2.id AND ps2.temporada = YEAR(CURDATE())
    -- Pádel
    LEFT JOIN padel_teams pt1 ON pt1.id = m.team1_id
    LEFT JOIN padel_teams pt2 ON pt2.id = m.team2_id
    WHERE 1 = 1
  `;

  const params = [];

  if (estado) {
    query += ' AND m.estado = ?';
    params.push(estado);
  }

  if (deporte) {
    query += ' AND m.deporte = ?';
    params.push(deporte);
  }

  if (torneo_id) {
    query += ' AND m.tournament_id = ?';
    params.push(torneo_id);
  }

  query += ' ORDER BY m.fecha_inicio DESC';

  const [rows] = await db.query(query, params);
  return rows.map(r => formatMatchSummary(r));
};

exports.getById = async (id) => {
  const [rows] = await db.query(
    `SELECT
      m.id,
      m.deporte,
      m.ronda,
      m.estado,
      m.ganador,
      m.duracion_min,
      m.fecha_inicio,
      m.superficie,
      m.pista,
      t.id     AS torneo_id,
      t.nombre AS torneo_nombre,
      tc.flag  AS torneo_flag,
      p1.id           AS p1_id,
      p1.nombre_corto AS p1_nombre_corto,
      p1c.flag        AS p1_flag,
      ps1.ranking     AS p1_ranking,
      p2.id           AS p2_id,
      p2.nombre_corto AS p2_nombre_corto,
      p2c.flag        AS p2_flag,
      ps2.ranking     AS p2_ranking,
      pt1.id     AS team1_id,
      pt1.nombre AS team1_nombre,
      pt2.id     AS team2_id,
      pt2.nombre AS team2_nombre
    FROM matches m
    LEFT JOIN tournaments t   ON t.id  = m.tournament_id
    LEFT JOIN countries   tc  ON tc.id = t.country_id
    LEFT JOIN players p1      ON p1.id = m.player1_id
    LEFT JOIN countries p1c   ON p1c.id = p1.country_id
    LEFT JOIN player_stats ps1 ON ps1.player_id = p1.id AND ps1.anio = YEAR(CURDATE())
    LEFT JOIN players p2      ON p2.id = m.player2_id
    LEFT JOIN countries p2c   ON p2c.id = p2.country_id
    LEFT JOIN player_stats ps2 ON ps2.player_id = p2.id AND ps2.anio = YEAR(CURDATE())
    LEFT JOIN padel_teams pt1 ON pt1.id = m.team1_id
    LEFT JOIN padel_teams pt2 ON pt2.id = m.team2_id
    WHERE m.id = ?
    LIMIT 1`,
    [id]
  );

  if (!rows.length) {
    throw { status: 404, message: 'Partido no encontrado' };
  }

  const match = rows[0];

  // Obtener sets del partido
  const [sets] = await db.query(
    `SELECT numero_set, games_p1, games_p2, tiebreak_p1, tiebreak_p2, completado
     FROM match_sets
     WHERE match_id = ?
     ORDER BY numero_set ASC`,
    [id]
  );

  return formatMatchDetail(match, sets);
};

// ── Formateadores ─────────────────────────────────────────────────────────────
function formatMatchSummary(row) {
  const base = {
    id:           row.id,
    deporte:      row.deporte,
    ronda:        row.ronda,
    estado:       row.estado,
    ganador:      row.ganador,
    duracion_min: row.duracion_min,
    fecha_inicio: row.fecha_inicio,
    superficie:   row.superficie,
    pista:        row.pista,
    tournament: {
      id:     row.torneo_id,
      nombre: row.torneo_nombre,
      flag:   row.torneo_flag,
    },
  };

  if (row.deporte === 'padel') {
    base.team1 = { id: row.team1_id, nombre: row.team1_nombre };
    base.team2 = { id: row.team2_id, nombre: row.team2_nombre };
  } else {
    base.player1 = {
      id:          row.p1_id,
      nombre_corto: row.p1_nombre_corto,
      flag:        row.p1_flag,
      ranking:     row.p1_ranking || null,
    };
    base.player2 = {
      id:          row.p2_id,
      nombre_corto: row.p2_nombre_corto,
      flag:        row.p2_flag,
      ranking:     row.p2_ranking || null,
    };
  }

  return base;
}

function formatMatchDetail(row, sets) {
  const base = formatMatchSummary(row);
  base.sets = sets.map(s => ({
    numero_set:   s.numero_set,
    games_p1:     s.games_p1,
    games_p2:     s.games_p2,
    tiebreak_p1:  s.tiebreak_p1 ?? null,
    tiebreak_p2:  s.tiebreak_p2 ?? null,
    completado:   Boolean(s.completado),
  }));
  return base;
}