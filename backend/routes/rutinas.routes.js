const express = require('express');
const pool = require('../db');
const verificarToken = require('../middlewares/verificarToken');
const verificarRol = require('../middlewares/verificarRol');
const { validarRutina } = require('../middlewares/validarCampos');

const router = express.Router();

router.use(verificarToken);

const consultaRutinas = `
  SELECT r.*, cliente.nombre AS cliente, entrenador.nombre AS entrenador
  FROM rutinas r
  INNER JOIN usuarios cliente ON cliente.id = r.cliente_id
  INNER JOIN usuarios entrenador ON entrenador.id = r.entrenador_id
`;

async function obtenerEjercicios(rutinaId) {
  const [ejercicios] = await pool.query('SELECT * FROM rutina_ejercicios WHERE rutina_id = ? ORDER BY id ASC', [
    rutinaId
  ]);
  return ejercicios;
}

router.get('/', async (req, res, next) => {
  try {
    const [rutinas] = await pool.query(`${consultaRutinas} ORDER BY r.fecha_asignacion DESC`);
    res.json(rutinas);
  } catch (error) {
    next(error);
  }
});

router.get('/mis-rutinas', verificarRol('cliente'), async (req, res, next) => {
  try {
    const [rutinas] = await pool.query(`${consultaRutinas} WHERE r.cliente_id = ? ORDER BY r.fecha_asignacion DESC`, [
      req.usuario.id
    ]);
    res.json(rutinas);
  } catch (error) {
    next(error);
  }
});

router.get('/cliente/:clienteId', async (req, res, next) => {
  try {
    if (req.usuario.rol === 'cliente' && Number(req.params.clienteId) !== req.usuario.id) {
      return res.status(403).json({ mensaje: 'No tienes permisos para esta accion' });
    }

    const [rutinas] = await pool.query(`${consultaRutinas} WHERE r.cliente_id = ? ORDER BY r.fecha_asignacion DESC`, [
      req.params.clienteId
    ]);
    res.json(rutinas);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const [rutinas] = await pool.query(`${consultaRutinas} WHERE r.id = ?`, [req.params.id]);
    if (rutinas.length === 0) return res.status(404).json({ mensaje: 'Rutina no encontrada' });
    if (req.usuario.rol === 'cliente' && rutinas[0].cliente_id !== req.usuario.id) {
      return res.status(403).json({ mensaje: 'No tienes permisos para esta accion' });
    }

    rutinas[0].ejercicios = await obtenerEjercicios(req.params.id);
    res.json(rutinas[0]);
  } catch (error) {
    next(error);
  }
});

router.post('/', verificarRol('administrador', 'entrenador'), validarRutina, async (req, res, next) => {
  const conexion = await pool.getConnection();

  try {
    const { cliente_id, entrenador_id, nombre, descripcion, objetivo, nivel, fecha_asignacion, ejercicios = [] } = req.body;

    await conexion.beginTransaction();
    const [resultado] = await conexion.query(
      `INSERT INTO rutinas (cliente_id, entrenador_id, nombre, descripcion, objetivo, nivel, fecha_asignacion)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [cliente_id, entrenador_id, nombre, descripcion || null, objetivo || null, nivel || 'principiante', fecha_asignacion]
    );

    for (const ejercicio of ejercicios) {
      if (!ejercicio.ejercicio) continue;
      await conexion.query(
        `INSERT INTO rutina_ejercicios (rutina_id, ejercicio, series, repeticiones, descanso)
         VALUES (?, ?, ?, ?, ?)`,
        [
          resultado.insertId,
          ejercicio.ejercicio,
          ejercicio.series || null,
          ejercicio.repeticiones || null,
          ejercicio.descanso || null
        ]
      );
    }

    await conexion.commit();
    res.status(201).json({ id: resultado.insertId, ...req.body });
  } catch (error) {
    await conexion.rollback();
    next(error);
  } finally {
    conexion.release();
  }
});

router.put('/:id', verificarRol('administrador', 'entrenador'), validarRutina, async (req, res, next) => {
  const conexion = await pool.getConnection();

  try {
    const { cliente_id, entrenador_id, nombre, descripcion, objetivo, nivel, fecha_asignacion, ejercicios = [] } = req.body;

    await conexion.beginTransaction();
    await conexion.query(
      `UPDATE rutinas
       SET cliente_id = ?, entrenador_id = ?, nombre = ?, descripcion = ?, objetivo = ?, nivel = ?, fecha_asignacion = ?
       WHERE id = ?`,
      [cliente_id, entrenador_id, nombre, descripcion || null, objetivo || null, nivel, fecha_asignacion, req.params.id]
    );

    await conexion.query('DELETE FROM rutina_ejercicios WHERE rutina_id = ?', [req.params.id]);
    for (const ejercicio of ejercicios) {
      if (!ejercicio.ejercicio) continue;
      await conexion.query(
        `INSERT INTO rutina_ejercicios (rutina_id, ejercicio, series, repeticiones, descanso)
         VALUES (?, ?, ?, ?, ?)`,
        [
          req.params.id,
          ejercicio.ejercicio,
          ejercicio.series || null,
          ejercicio.repeticiones || null,
          ejercicio.descanso || null
        ]
      );
    }

    await conexion.commit();
    res.json({ mensaje: 'Rutina actualizada' });
  } catch (error) {
    await conexion.rollback();
    next(error);
  } finally {
    conexion.release();
  }
});

router.delete('/:id', verificarRol('administrador', 'entrenador'), async (req, res, next) => {
  try {
    await pool.query('DELETE FROM rutinas WHERE id = ?', [req.params.id]);
    res.json({ mensaje: 'Rutina eliminada' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
