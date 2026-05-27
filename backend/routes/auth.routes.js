const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { validarUsuario, rolesPermitidos } = require('../middlewares/validarCampos');

const router = express.Router();

router.post('/register', validarUsuario(true), async (req, res, next) => {
  try {
    const { nombre, correo, password, rol, telefono } = req.body;

    if (!rolesPermitidos.includes(rol)) {
      return res.status(400).json({ mensaje: 'Rol no permitido' });
    }

    const [existente] = await pool.query('SELECT id FROM usuarios WHERE correo = ?', [correo]);
    if (existente.length > 0) {
      return res.status(409).json({ mensaje: 'El correo ya esta registrado' });
    }

    const hash = await bcrypt.hash(password, 10);
    const [resultado] = await pool.query(
      'INSERT INTO usuarios (nombre, correo, password, rol, telefono) VALUES (?, ?, ?, ?, ?)',
      [nombre, correo, hash, rol, telefono || null]
    );

    const usuario = { id: resultado.insertId, nombre, correo, rol, telefono: telefono || null, activo: true };
    res.status(201).json({ mensaje: 'Usuario registrado', usuario });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({ mensaje: 'Correo y password son obligatorios' });
    }

    const [usuarios] = await pool.query('SELECT * FROM usuarios WHERE correo = ? AND activo = TRUE', [correo]);
    if (usuarios.length === 0) {
      return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
    }

    const usuarioDb = usuarios[0];
    const passwordValido = await bcrypt.compare(password, usuarioDb.password);

    if (!passwordValido) {
      return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
    }

    const usuario = {
      id: usuarioDb.id,
      nombre: usuarioDb.nombre,
      correo: usuarioDb.correo,
      rol: usuarioDb.rol,
      telefono: usuarioDb.telefono,
      activo: Boolean(usuarioDb.activo)
    };

    const token = jwt.sign(usuario, process.env.JWT_SECRET || 'carbono_powerlab_secret', { expiresIn: '8h' });

    res.json({ mensaje: 'Login correcto', token, usuario, rol: usuario.rol });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
