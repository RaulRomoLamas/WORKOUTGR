const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const usuariosRoutes = require('./routes/usuarios.routes');
const membresiasRoutes = require('./routes/membresias.routes');
const rutinasRoutes = require('./routes/rutinas.routes');
const progresoRoutes = require('./routes/progreso.routes');
const reportesRoutes = require('./routes/reportes.routes');
const mensajesRoutes = require('./routes/mensajes.routes');

const app = express();
const PORT = process.env.PORT || 3000;
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:4200'
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ mensaje: 'API CARBONO POWERLAB funcionando' });
});

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/membresias', membresiasRoutes);
app.use('/api/rutinas', rutinasRoutes);
app.use('/api/progreso', progresoRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/mensajes', mensajesRoutes);

app.use((req, res) => {
  res.status(404).json({ mensaje: 'Ruta no encontrada' });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ mensaje: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`Servidor CARBONO POWERLAB en puerto ${PORT}`);
});
