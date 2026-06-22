require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes       = require('./src/modules/auth/auth.routes');
const playersRoutes    = require('./src/modules/players/players.routes');
const teamsRoutes      = require('./src/modules/teams/teams.routes');
const tournamentsRoutes = require('./src/modules/tournaments/tournaments.routes');
const matchesRoutes    = require('./src/modules/matches/matches.routes');
const newsRoutes       = require('./src/modules/news/news.routes');
const favoritesRoutes  = require('./src/modules/favorites/favorites.routes');

const app = express();

// ── Middlewares globales ──────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Rutas ─────────────────────────────────────────────────────────────────────
app.use('/api/auth',        authRoutes);
app.use('/api/players',     playersRoutes);
app.use('/api/teams',       teamsRoutes);
app.use('/api/tournaments', tournamentsRoutes);
app.use('/api/matches',     matchesRoutes);
app.use('/api/news',        newsRoutes);
app.use('/api/favorites',   favoritesRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'ScoreApp API corriendo correctamente', timestamp: new Date() });
});

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ ok: false, message: 'Ruta no encontrada' });
});

// ── Error handler global ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err);
  res.status(500).json({ ok: false, message: 'Error interno del servidor' });
});

// ── Iniciar servidor ──────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅  ScoreApp API escuchando en http://localhost:${PORT}`);
});