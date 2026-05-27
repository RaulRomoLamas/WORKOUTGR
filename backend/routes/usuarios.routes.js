const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');
const verificarToken = require('../middlewares/verificarToken');
const verificarRol = require('../middlewares/verificarRol');
const { validarUsuario, rolesPermitidos } = require('../middlewares/validarCampos');

const router = express.Router();

router.use(verificarToken);

router.get('/', verificarRol('administrador', 'entrenador'), async (req, res, next) => {
  try {
    const [usuarios] = await pool.query(
      'SELECT id, nombre, correo, rol, telefono, fecha_registro, activo FROM usuarios ORDER BY id DESC'
    );
    res.json(usuarios);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const [usuarios] = await pool.query(
      'SELECT id, nombre, correo, rol, telefono, fecha_registro, activo FROM usuarios WHERE id = ?',
      [req.params.id]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    res.json(usuarios[0]);
  } catch (error) {
    next(error);
  }
});

router.post('/', verificarRol('administrador'), validarUsuario(true), async (req, res, next) => {
  try {
    const { nombre, correo, password, rol, telefono } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const [resultado] = await pool.query(
      'INSERT INTO usuarios (nombre, correo, password, rol, telefono) VALUES (?, ?, ?, ?, ?)',
      [nombre, correo, hash, rol, telefono || null]
    );

    res.status(201).json({ id: resultado.insertId, nombre, correo, rol, telefono: telefono || null });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ mensaje: 'El correo ya existe' });
    }
    next(error);
  }
});

router.put('/:id', verificarRol('administrador'), validarUsuario(false), async (req, res, next) => {
  try {
    const { nombre, correo, password, rol, telefono, activo } = req.body;

    if (!rolesPermitidos.includes(rol)) {
      return res.status(400).json({ mensaje: 'Rol no permitido' });
    }

    if (password) {
      const hash = await bcrypt.hash(password, 10);
      await pool.query(
        'UPDATE usuarios SET nombre = ?, correo = ?, password = ?, rol = ?, telefono = ?, activo = ? WHERE id = ?',
        [nombre, correo, hash, rol, telefono || null, activo !== false, req.params.id]
      );
    } else {
      await pool.query(
        'UPDATE usuarios SET nombre = ?, correo = ?, rol = ?, telefono = ?, activo = ? WHERE id = ?',
        [nombre, correo, rol, telefono || null, activo !== false, req.params.id]
      );
    }

    res.json({ mensaje: 'Usuario actualizado' });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', verificarRol('administrador'), async (req, res, next) => {
  try {
    await pool.query('UPDATE usuarios SET activo = FALSE WHERE id = ?', [req.params.id]);
    res.json({ mensaje: 'Usuario desactivado' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
