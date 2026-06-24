const db = require('../../config/db');

// ── Listar partidos ─────────────────────────────────────────────────────────────
exports.getAll = async ({ estado, deporte, torneo_id }) => {
  let query = `
    SELECT
      p.id,
      p.deporte,
      p.ronda,
      p.estado,
      p.ganador,
      p.duracion_min,
      p.fecha_inicio,
      p.notas,
      -- Torneo
      t.id     AS torneo_id,
      t.nombre AS torneo_nombre,
      -- Cancha / Sede
      c.nombre AS cancha_nombre,
      s.nombre AS sede_nombre,
      -- Tenis: jugador1
      j1.id       AS j1_id,
      j1.nombre   AS j1_nombre,
      j1.apellido AS j1_apellido,
      ct1.flag    AS j1_flag,
      st1.ranking AS j1_ranking,
      -- Tenis: jugador2
      j2.id       AS j2_id,
      j2.nombre   AS j2_nombre,
      j2.apellido AS j2_apellido,
      ct2.flag    AS j2_flag,
      st2.ranking AS j2_ranking,
      -- Pádel: equipo1
      e1.id     AS e1_id,
      e1.nombre AS e1_nombre,
      -- Pádel: equipo2
      e2.id     AS e2_id,
      e2.nombre AS e2_nombre
    FROM partidos p
    LEFT JOIN torneos  t   ON t.id  = p.torneo_id
    LEFT JOIN canchas  c   ON c.id  = p.cancha_id
    LEFT JOIN sedes    s   ON s.id  = c.sede_id
    -- Tenis
    LEFT JOIN jugadores  j1  ON j1.id = p.jugador1_id
    LEFT JOIN countries  ct1 ON ct1.id = j1.country_id
    LEFT JOIN jugador_stats st1 ON st1.jugador_id = j1.id AND st1.temporada = YEAR(CURDATE())
    LEFT JOIN jugadores  j2  ON j2.id = p.jugador2_id
    LEFT JOIN countries  ct2 ON ct2.id = j2.country_id
    LEFT JOIN jugador_stats st2 ON st2.jugador_id = j2.id AND st2.temporada = YEAR(CURDATE())
    -- Pádel
    LEFT JOIN equipos_padel e1 ON e1.id = p.equipo1_id
    LEFT JOIN equipos_padel e2 ON e2.id = p.equipo2_id
    WHERE 1 = 1
  `;

  const params = [];

  if (estado) {
    query += ' AND p.estado = ?';
    params.push(estado);
  }
  if (deporte) {
    query += ' AND p.deporte = ?';
    params.push(deporte);
  }
  if (torneo_id) {
    query += ' AND p.torneo_id = ?';
    params.push(torneo_id);
  }

  query += ' ORDER BY p.fecha_inicio DESC';

  const [rows] = await db.query(query, params);
  return rows.map(formatSummary);
};

// ── Obtener por ID ──────────────────────────────────────────────────────────────
exports.getById = async (id) => {
  const [rows] = await db.query(
    `SELECT
      p.id,
      p.deporte,
      p.ronda,
      p.estado,
      p.ganador,
      p.duracion_min,
      p.fecha_inicio,
      p.notas,
      t.id     AS torneo_id,
      t.nombre AS torneo_nombre,
      c.nombre AS cancha_nombre,
      s.nombre AS sede_nombre,
      j1.id       AS j1_id,
      j1.nombre   AS j1_nombre,
      j1.apellido AS j1_apellido,
      ct1.flag    AS j1_flag,
      st1.ranking AS j1_ranking,
      j2.id       AS j2_id,
      j2.nombre   AS j2_nombre,
      j2.apellido AS j2_apellido,
      ct2.flag    AS j2_flag,
      st2.ranking AS j2_ranking,
      e1.id     AS e1_id,
      e1.nombre AS e1_nombre,
      e2.id     AS e2_id,
      e2.nombre AS e2_nombre
    FROM partidos p
    LEFT JOIN torneos  t   ON t.id  = p.torneo_id
    LEFT JOIN canchas  c   ON c.id  = p.cancha_id
    LEFT JOIN sedes    s   ON s.id  = c.sede_id
    LEFT JOIN jugadores  j1  ON j1.id = p.jugador1_id
    LEFT JOIN countries  ct1 ON ct1.id = j1.country_id
    LEFT JOIN jugador_stats st1 ON st1.jugador_id = j1.id AND st1.temporada = YEAR(CURDATE())
    LEFT JOIN jugadores  j2  ON j2.id = p.jugador2_id
    LEFT JOIN countries  ct2 ON ct2.id = j2.country_id
    LEFT JOIN jugador_stats st2 ON st2.jugador_id = j2.id AND st2.temporada = YEAR(CURDATE())
    LEFT JOIN equipos_padel e1 ON e1.id = p.equipo1_id
    LEFT JOIN equipos_padel e2 ON e2.id = p.equipo2_id
    WHERE p.id = ?
    LIMIT 1`,
    [id]
  );

  if (!rows.length) throw { status: 404, message: 'Partido no encontrado' };

  const [sets] = await db.query(
    `SELECT numero_set, games_j1, games_j2, tiebreak_j1, tiebreak_j2, completado
     FROM sets_partido
     WHERE partido_id = ?
     ORDER BY numero_set ASC`,
    [id]
  );

  return formatDetail(rows[0], sets);
};

// ── Crear partido ───────────────────────────────────────────────────────────────
exports.create = async (body, created_by) => {
  const {
    torneo_id, cancha_id, ronda, deporte,
    jugador1_id, jugador2_id, equipo1_id, equipo2_id,
    estado, fecha_inicio, notas,
  } = body;

  const [result] = await db.query(
    `INSERT INTO partidos
       (torneo_id, cancha_id, ronda, deporte, jugador1_id, jugador2_id,
        equipo1_id, equipo2_id, estado, fecha_inicio, notas, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      torneo_id || null, cancha_id || null, ronda || null, deporte,
      jugador1_id || null, jugador2_id || null,
      equipo1_id  || null, equipo2_id  || null,
      estado || 'programado', fecha_inicio || null, notas || null, created_by,
    ]
  );

  return exports.getById(result.insertId);
};

// ── Actualizar partido ──────────────────────────────────────────────────────────
exports.update = async (id, body) => {
  const [existing] = await db.query('SELECT id FROM partidos WHERE id = ?', [id]);
  if (!existing.length) throw { status: 404, message: 'Partido no encontrado' };

  const {
    torneo_id, cancha_id, ronda, deporte,
    jugador1_id, jugador2_id, equipo1_id, equipo2_id,
    estado, ganador, duracion_min, fecha_inicio, notas,
  } = body;

  await db.query(
    `UPDATE partidos
     SET torneo_id = ?, cancha_id = ?, ronda = ?, deporte = ?,
         jugador1_id = ?, jugador2_id = ?, equipo1_id = ?, equipo2_id = ?,
         estado = ?, ganador = ?, duracion_min = ?, fecha_inicio = ?, notas = ?
     WHERE id = ?`,
    [
      torneo_id || null, cancha_id || null, ronda || null, deporte,
      jugador1_id || null, jugador2_id || null,
      equipo1_id  || null, equipo2_id  || null,
      estado, ganador || null, duracion_min || null, fecha_inicio || null,
      notas || null, id,
    ]
  );

  return exports.getById(id);
};

// ── Actualizar marcador en tiempo real ──────────────────────────────────────────
exports.updateMarcador = async (id, { sets, estado, ganador }) => {
  const [existing] = await db.query('SELECT id FROM partidos WHERE id = ?', [id]);
  if (!existing.length) throw { status: 404, message: 'Partido no encontrado' };

  // Actualizar estado y ganador del partido
  await db.query(
    'UPDATE partidos SET estado = ?, ganador = ? WHERE id = ?',
    [estado, ganador || null, id]
  );

  // Upsert cada set
  for (const set of sets) {
    await db.query(
      `INSERT INTO sets_partido (partido_id, numero_set, games_j1, games_j2, tiebreak_j1, tiebreak_j2, completado)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         games_j1    = VALUES(games_j1),
         games_j2    = VALUES(games_j2),
         tiebreak_j1 = VALUES(tiebreak_j1),
         tiebreak_j2 = VALUES(tiebreak_j2),
         completado  = VALUES(completado)`,
      [
        id, set.numero_set, set.games_j1, set.games_j2,
        set.tiebreak_j1 ?? null, set.tiebreak_j2 ?? null,
        set.completado ? 1 : 0,
      ]
    );
  }

  return exports.getById(id);
};

// ── Eliminar ────────────────────────────────────────────────────────────────────
exports.remove = async (id) => {
  const [existing] = await db.query('SELECT id FROM partidos WHERE id = ?', [id]);
  if (!existing.length) throw { status: 404, message: 'Partido no encontrado' };

  await db.query('DELETE FROM sets_partido WHERE partido_id = ?', [id]);
  await db.query('DELETE FROM partidos WHERE id = ?', [id]);

  return { message: 'Partido eliminado correctamente' };
};

// ── Formateadores ───────────────────────────────────────────────────────────────
function formatSummary(row) {
  const base = {
    id:           row.id,
    deporte:      row.deporte,
    ronda:        row.ronda,
    estado:       row.estado,
    ganador:      row.ganador,
    duracion_min: row.duracion_min,
    fecha_inicio: row.fecha_inicio,
    torneo: {
      id:     row.torneo_id,
      nombre: row.torneo_nombre,
    },
    cancha: {
      nombre: row.cancha_nombre,
      sede:   row.sede_nombre,
    },
  };

  if (row.deporte === 'padel') {
    base.equipo1 = { id: row.e1_id, nombre: row.e1_nombre };
    base.equipo2 = { id: row.e2_id, nombre: row.e2_nombre };
  } else {
    base.jugador1 = {
      id:       row.j1_id,
      nombre:   row.j1_nombre,
      apellido: row.j1_apellido,
      flag:     row.j1_flag,
      ranking:  row.j1_ranking || null,
    };
    base.jugador2 = {
      id:       row.j2_id,
      nombre:   row.j2_nombre,
      apellido: row.j2_apellido,
      flag:     row.j2_flag,
      ranking:  row.j2_ranking || null,
    };
  }

  return base;
}

function formatDetail(row, sets) {
  const base = formatSummary(row);
  base.notas = row.notas || null;
  base.sets  = sets.map((s) => ({
    numero_set:  s.numero_set,
    games_j1:    s.games_j1,
    games_j2:    s.games_j2,
    tiebreak_j1: s.tiebreak_j1 ?? null,
    tiebreak_j2: s.tiebreak_j2 ?? null,
    completado:  Boolean(s.completado),
  }));
  return base;
}