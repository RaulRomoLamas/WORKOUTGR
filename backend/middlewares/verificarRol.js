const verificarRol = (...roles) => (req, res, next) => {
  if (!req.usuario || !roles.includes(req.usuario.rol)) {
    return res.status(403).json({ mensaje: 'No tienes permisos para esta accion' });
  }

  next();
};

module.exports = verificarRol;
