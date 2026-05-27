const express = require('express');
const pool = require('../db');
const verificarToken = require('../middlewares/verificarToken');
const verificarRol = require('../middlewares/verificarRol');
const { validarMembresia } = require('../middlewares/validarCampos');

const router = express.Router();

router.use(verificarToken);

const estadoCalculadoSql = `
  CASE
    WHEN m.estado = 'cancelada' THEN 'cancelada'
    WHEN m.fecha_fin < CURDATE() THEN 'vencida'
    WHEN m.fecha_fin <= DATE_ADD(CURDATE(), INTERVAL 7 DAY) THEN 'vence_pronto'
    ELSE 'activa'
  END AS estado
`;

const consultaBase = `
  SELECT
    m.id,
    m.usuario_id,
    m.tipo,
    m.fecha_inicio,
    m.fecha_fin,
    ${estadoCalculadoSql},
    m.monto,
    COALESCE((SELECT SUM(pm.monto) FROM pagos_membresia pm WHERE pm.membresia_id = m.id), m.monto) AS total_pagado,
    COALESCE((SELECT pm.monto FROM pagos_membresia pm WHERE pm.membresia_id = m.id ORDER BY pm.fecha_pago DESC LIMIT 1), m.monto) AS ultimo_pago_monto,
    (SELECT pm.fecha_pago FROM pagos_membresia pm WHERE pm.membresia_id = m.id ORDER BY pm.fecha_pago DESC LIMIT 1) AS ultimo_pago_fecha,
    (SELECT COUNT(*) FROM pagos_membresia pm WHERE pm.membresia_id = m.id) AS renovaciones,
    u.nombre AS cliente,
    u.correo
  FROM membresias m
  INNER JOIN usuarios u ON u.id = m.usuario_id
`;

const obtenerEstadoGuardado = (fechaFin, estado = 'activa') => {
  if (estado === 'cancelada') return 'cancelada';

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const fin = new Date(`${fechaFin}T00:00:00`);
  return fin < hoy ? 'vencida' : 'activa';
};

const fechaSql = (fecha) => {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
};

const sumarMeses = (fecha, meses) => {
  const base = new Date(`${fecha}T00:00:00`);
  const ultimoDiaDestino = new Date(base.getFullYear(), base.getMonth() + meses + 1, 0).getDate();
  return new Date(base.getFullYear(), base.getMonth() + meses, Math.min(base.getDate(), ultimoDiaDestino));
};

const mesesEntreFechas = (inicio, fin) => {
  const fechaInicio = new Date(`${inicio}T00:00:00`);
  const fechaFin = new Date(`${fin}T00:00:00`);
  fechaFin.setDate(fechaFin.getDate() + 1);

  const meses = (fechaFin.getFullYear() - fechaInicio.getFullYear()) * 12
    + fechaFin.getMonth()
    - fechaInicio.getMonth();

  return Math.max(1, meses || 1);
};

const sumarPeriodo = (inicio, meses) => {
  const fin = sumarMeses(inicio, meses);
  fin.setDate(fin.getDate() - 1);
  return fechaSql(fin);
};

router.get('/', async (req, res, next) => {
  try {
    const [membresias] = await pool.query(`${consultaBase} ORDER BY m.fecha_fin DESC`);
    res.json(membresias);
  } catch (error) {
    next(error);
  }
});

router.get('/vencidas/lista', async (req, res, next) => {
  try {
    const [membresias] = await pool.query(
      `${consultaBase} WHERE m.estado <> 'cancelada' AND m.fecha_fin < CURDATE() ORDER BY m.fecha_fin ASC`
    );
    res.json(membresias);
  } catch (error) {
    next(error);
  }
});

router.get('/cliente/:clienteId', async (req, res, next) => {
  try {
    const [membresias] = await pool.query(`${consultaBase} WHERE m.usuario_id = ? ORDER BY m.fecha_fin DESC`, [
      req.params.clienteId
    ]);
    res.json(membresias);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const [membresias] = await pool.query(`${consultaBase} WHERE m.id = ?`, [req.params.id]);
    if (membresias.length === 0) return res.status(404).json({ mensaje: 'Membresia no encontrada' });
    res.json(membresias[0]);
  } catch (error) {
    next(error);
  }
});

router.post('/', verificarRol('administrador'), validarMembresia, async (req, res, next) => {
  const conexion = await pool.getConnection();

  try {
    const { usuario_id, tipo, fecha_inicio, fecha_fin, estado, monto } = req.body;
    const mesesComprados = mesesEntreFechas(fecha_inicio, fecha_fin);
    await conexion.beginTransaction();

    const [existentes] = await conexion.query(
      `SELECT id, tipo, fecha_inicio, fecha_fin, estado, monto
       FROM membresias
       WHERE usuario_id = ? AND estado <> 'cancelada'
       ORDER BY fecha_fin DESC
       LIMIT 1`,
      [usuario_id]
    );

    if (existentes.length > 0) {
      const membresiaActual = existentes[0];
      const finActual = fechaSql(new Date(membresiaActual.fecha_fin));
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      const fechaFinActual = new Date(`${finActual}T00:00:00`);
      const inicioExtension = fechaFinActual >= hoy
        ? fechaSql(new Date(fechaFinActual.setDate(fechaFinActual.getDate() + 1)))
        : fecha_inicio;
      const fechaInicioGuardada = fechaFinActual >= hoy
        ? fechaSql(new Date(membresiaActual.fecha_inicio))
        : fecha_inicio;
      const nuevaFechaFin = sumarPeriodo(inicioExtension, mesesComprados);
      const nuevoMonto = Number(membresiaActual.monto) + Number(monto);
      const estadoGuardado = obtenerEstadoGuardado(nuevaFechaFin, estado);

      await conexion.query(
        'UPDATE membresias SET tipo = ?, fecha_inicio = ?, fecha_fin = ?, estado = ?, monto = ? WHERE id = ?',
        [tipo || membresiaActual.tipo || 'mensual', fechaInicioGuardada, nuevaFechaFin, estadoGuardado, nuevoMonto, membresiaActual.id]
      );

      await conexion.query(
        'INSERT INTO pagos_membresia (membresia_id, meses, monto) VALUES (?, ?, ?)',
        [membresiaActual.id, mesesComprados, monto]
      );

      await conexion.commit();

      return res.json({
        id: membresiaActual.id,
        usuario_id,
        tipo: tipo || membresiaActual.tipo || 'mensual',
        fecha_inicio: fechaInicioGuardada,
        fecha_fin: nuevaFechaFin,
        estado: estadoGuardado,
        monto: nuevoMonto,
        mensaje: 'Membresia renovada'
      });
    }

    const estadoGuardado = obtenerEstadoGuardado(fecha_fin, estado);
    const [resultado] = await conexion.query(
      'INSERT INTO membresias (usuario_id, tipo, fecha_inicio, fecha_fin, estado, monto) VALUES (?, ?, ?, ?, ?, ?)',
      [usuario_id, tipo || 'mensual', fecha_inicio, fecha_fin, estadoGuardado, monto]
    );

    await conexion.query(
      'INSERT INTO pagos_membresia (membresia_id, meses, monto) VALUES (?, ?, ?)',
      [resultado.insertId, mesesComprados, monto]
    );

    await conexion.commit();
    res.status(201).json({ id: resultado.insertId, ...req.body, estado: estadoGuardado });
  } catch (error) {
    await conexion.rollback();
    next(error);
  } finally {
    conexion.release();
  }
});

router.put('/:id', verificarRol('administrador'), validarMembresia, async (req, res, next) => {
  try {
    const { usuario_id, tipo, fecha_inicio, fecha_fin, estado, monto } = req.body;
    const estadoGuardado = obtenerEstadoGuardado(fecha_fin, estado);
    await pool.query(
      'UPDATE membresias SET usuario_id = ?, tipo = ?, fecha_inicio = ?, fecha_fin = ?, estado = ?, monto = ? WHERE id = ?',
      [usuario_id, tipo, fecha_inicio, fecha_fin, estadoGuardado, monto, req.params.id]
    );
    res.json({ mensaje: 'Membresia actualizada' });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', verificarRol('administrador'), async (req, res, next) => {
  try {
    await pool.query("UPDATE membresias SET estado = 'cancelada' WHERE id = ?", [req.params.id]);
    res.json({ mensaje: 'Membresia cancelada' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
