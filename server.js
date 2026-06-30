require('dotenv').config();
const express = require('express');
const cors    = require('cors');

// ── Módulos nuevos (esquema local) ───────────────────────────────────────────
const authRoutes       = require('./src/modules/auth/auth.routes');
const jugadoresRoutes  = require('./src/modules/jugadores/jugadores.routes');
const equiposRoutes    = require('./src/modules/equipos/equipos.routes');
const torneosRoutes    = require('./src/modules/torneos/torneos.routes');
const partidosRoutes   = require('./src/modules/matches/matches.routes');
const anunciosRoutes   = require('./src/modules/news/news.routes');
const favoritosRoutes  = require('./src/modules/favorites/favorites.routes');
const categoriasRoutes = require('./src/modules/categorias/categorias.routes');
const sedesRoutes      = require('./src/modules/sedes/sedes.routes');
const posicionesRoutes = require('./src/modules/posiciones/posiciones.routes');
const usersRoutes       = require('./src/modules/users/users.routes');

const app = express();

// ── Middlewares globales ───────────────────────────────────────────────────────
app.use(cors({
  origin:      process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Rutas ─────────────────────────────────────────────────────────────────────
app.use('/api/auth',       authRoutes);
app.use('/api/jugadores',  jugadoresRoutes);
app.use('/api/equipos',    equiposRoutes);
app.use('/api/torneos',    torneosRoutes);
app.use('/api/partidos',   partidosRoutes);
app.use('/api/anuncios',   anunciosRoutes);
app.use('/api/favoritos',  favoritosRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/sedes',      sedesRoutes);
app.use('/api/posiciones', posicionesRoutes);
app.use('/api/users',      usersRoutes);

// ── Health check ───────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'ScoreApp API corriendo', timestamp: new Date() });
});

// ── 404 ────────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ ok: false, message: 'Ruta no encontrada' });
});

// ── Error global ───────────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err);
  res.status(err.status || 500).json({ ok: false, message: err.message || 'Error interno' });
});

// ── Iniciar ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅  ScoreApp API en http://localhost:${PORT}`);
}); 