const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ mensaje: 'Token no proporcionado' });
  }

  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET || 'carbono_powerlab_secret');
    next();
  } catch (error) {
    return res.status(401).json({ mensaje: 'Token invalido o expirado' });
  }
};

module.exports = verificarToken;
