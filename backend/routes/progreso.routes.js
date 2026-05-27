const express = require('express');
const pool = require('../db');
const verificarToken = require('../middlewares/verificarToken');
const verificarRol = require('../middlewares/verificarRol');
const { validarProgreso } = require('../middlewares/validarCampos');

const router = express.Router();

router.use(verificarToken);

const consultaProgreso = `
  SELECT p.*, u.nombre AS cliente
  FROM progreso p
  INNER JOIN usuarios u ON u.id = p.cliente_id
`;

router.get('/', async (req, res, next) => {
  try {
    const [registros] = await pool.query(`${consultaProgreso} ORDER BY p.fecha_registro DESC`);
    res.json(registros);
  } catch (error) {
    next(error);
  }
});

router.get('/cliente/:clienteId', async (req, res, next) => {
  try {
    const [registros] = await pool.query(`${consultaProgreso} WHERE p.cliente_id = ? ORDER BY p.fecha_registro DESC`, [
      req.params.clienteId
    ]);
    res.json(registros);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const [registros] = await pool.query(`${consultaProgreso} WHERE p.id = ?`, [req.params.id]);
    if (registros.length === 0) return res.status(404).json({ mensaje: 'Registro no encontrado' });
    res.json(registros[0]);
  } catch (error) {
    next(error);
  }
});

router.post('/', verificarRol('administrador', 'entrenador'), validarProgreso, async (req, res, next) => {
  try {
    const { cliente_id, peso, porcentaje_grasa, cintura, pecho, brazo, pierna, fecha_registro, observaciones } = req.body;
    const [resultado] = await pool.query(
      `INSERT INTO progreso
       (cliente_id, peso, porcentaje_grasa, cintura, pecho, brazo, pierna, fecha_registro, observaciones)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cliente_id,
        peso || null,
        porcentaje_grasa || null,
        cintura || null,
        pecho || null,
        brazo || null,
        pierna || null,
        fecha_registro,
        observaciones || null
      ]
    );

    res.status(201).json({ id: resultado.insertId, ...req.body });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', verificarRol('administrador', 'entrenador'), validarProgreso, async (req, res, next) => {
  try {
    const { cliente_id, peso, porcentaje_grasa, cintura, pecho, brazo, pierna, fecha_registro, observaciones } = req.body;
    await pool.query(
      `UPDATE progreso
       SET cliente_id = ?, peso = ?, porcentaje_grasa = ?, cintura = ?, pecho = ?, brazo = ?, pierna = ?,
           fecha_registro = ?, observaciones = ?
       WHERE id = ?`,
      [
        cliente_id,
        peso || null,
        porcentaje_grasa || null,
        cintura || null,
        pecho || null,
        brazo || null,
        pierna || null,
        fecha_registro,
        observaciones || null,
        req.params.id
      ]
    );

    res.json({ mensaje: 'Progreso actualizado' });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', verificarRol('administrador', 'entrenador'), async (req, res, next) => {
  try {
    await pool.query('DELETE FROM progreso WHERE id = ?', [req.params.id]);
    res.json({ mensaje: 'Registro eliminado' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
