const express = require('express');
const pool = require('../db');
const verificarToken = require('../middlewares/verificarToken');
const verificarRol = require('../middlewares/verificarRol');
const { validarMensaje } = require('../middlewares/validarCampos');

const router = express.Router();

router.get('/', verificarToken, verificarRol('administrador'), async (req, res, next) => {
  try {
    const [mensajes] = await pool.query('SELECT * FROM mensajes ORDER BY fecha DESC');
    res.json(mensajes);
  } catch (error) {
    next(error);
  }
});

router.post('/', validarMensaje, async (req, res, next) => {
  try {
    const { nombre, correo, asunto, mensaje } = req.body;
    const [resultado] = await pool.query(
      'INSERT INTO mensajes (nombre, correo, asunto, mensaje) VALUES (?, ?, ?, ?)',
      [nombre, correo, asunto, mensaje]
    );
    res.status(201).json({ mensaje: 'Mensaje enviado', id: resultado.insertId });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', verificarToken, verificarRol('administrador'), async (req, res, next) => {
  try {
    await pool.query('DELETE FROM mensajes WHERE id = ?', [req.params.id]);
    res.json({ mensaje: 'Mensaje eliminado' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
