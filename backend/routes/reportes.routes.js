const express = require('express');
const pool = require('../db');
const verificarToken = require('../middlewares/verificarToken');
const verificarRol = require('../middlewares/verificarRol');

const router = express.Router();

router.use(verificarToken);

router.get('/resumen', verificarRol('administrador', 'entrenador'), async (req, res, next) => {
  try {
    const [[usuarios]] = await pool.query('SELECT COUNT(*) AS totalUsuarios FROM usuarios WHERE activo = TRUE');
    const [[clientes]] = await pool.query(
      "SELECT COUNT(*) AS totalClientes FROM usuarios WHERE rol = 'cliente' AND activo = TRUE"
    );
    const [[entrenadores]] = await pool.query(
      "SELECT COUNT(*) AS totalEntrenadores FROM usuarios WHERE rol = 'entrenador' AND activo = TRUE"
    );
    const [[activas]] = await pool.query(
      "SELECT COUNT(*) AS membresiasActivas FROM membresias WHERE estado <> 'cancelada' AND fecha_fin >= CURDATE()"
    );
    const [[vencidas]] = await pool.query(
      "SELECT COUNT(*) AS membresiasVencidas FROM membresias WHERE estado <> 'cancelada' AND fecha_fin < CURDATE()"
    );
    const [[vencenPronto]] = await pool.query(
      `SELECT COUNT(*) AS membresiasVencenPronto
       FROM membresias
       WHERE estado <> 'cancelada'
         AND fecha_fin >= CURDATE()
         AND fecha_fin <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)`
    );
    const [[pagosHoy]] = await pool.query(
      'SELECT COUNT(*) AS pagosHoy, COALESCE(SUM(monto), 0) AS ingresosHoy FROM pagos_membresia WHERE DATE(fecha_pago) = CURDATE()'
    );
    const [[rutinas]] = await pool.query('SELECT COUNT(*) AS totalRutinas FROM rutinas');
    const [[progreso]] = await pool.query('SELECT COUNT(*) AS totalRegistrosProgreso FROM progreso');

    res.json({
      totalUsuarios: usuarios.totalUsuarios,
      totalClientes: clientes.totalClientes,
      totalEntrenadores: entrenadores.totalEntrenadores,
      membresiasActivas: activas.membresiasActivas,
      membresiasVencidas: vencidas.membresiasVencidas,
      membresiasVencenPronto: vencenPronto.membresiasVencenPronto,
      pagosHoy: pagosHoy.pagosHoy,
      ingresosHoy: pagosHoy.ingresosHoy,
      totalRutinas: rutinas.totalRutinas,
      totalRegistrosProgreso: progreso.totalRegistrosProgreso
    });
  } catch (error) {
    next(error);
  }
});

router.get('/membresias-vencidas', async (req, res, next) => {
  try {
    const [membresias] = await pool.query(
      `SELECT m.*, u.nombre AS cliente, u.correo
       FROM membresias m
       INNER JOIN usuarios u ON u.id = m.usuario_id
       WHERE m.estado <> 'cancelada' AND m.fecha_fin < CURDATE()
       ORDER BY m.fecha_fin ASC`
    );
    res.json(membresias);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
