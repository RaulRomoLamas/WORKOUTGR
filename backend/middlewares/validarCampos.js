const rolesPermitidos = ['administrador', 'entrenador', 'cliente'];

const validarCorreo = (correo) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo || '');

const responderErrores = (res, errores) => {
  if (errores.length > 0) {
    res.status(400).json({ mensaje: 'Datos invalidos', errores });
    return true;
  }

  return false;
};

const validarUsuario = (requerirPassword = true) => (req, res, next) => {
  const { nombre, correo, password, rol } = req.body;
  const errores = [];

  if (!nombre) errores.push('El nombre es obligatorio');
  if (!correo) errores.push('El correo es obligatorio');
  if (correo && !validarCorreo(correo)) errores.push('El correo no tiene un formato valido');
  if (requerirPassword && !password) errores.push('El password es obligatorio');
  if (!rol || !rolesPermitidos.includes(rol)) errores.push('El rol no es valido');

  if (responderErrores(res, errores)) return;
  next();
};

const validarMembresia = (req, res, next) => {
  const { usuario_id, fecha_inicio, fecha_fin, estado, monto } = req.body;
  const errores = [];

  if (!usuario_id) errores.push('El usuario_id es obligatorio');
  if (!fecha_inicio) errores.push('La fecha_inicio es obligatoria');
  if (!fecha_fin) errores.push('La fecha_fin es obligatoria');
  if (fecha_inicio && fecha_fin && new Date(`${fecha_fin}T00:00:00`) < new Date(`${fecha_inicio}T00:00:00`)) {
    errores.push('La fecha_fin no puede ser anterior a la fecha_inicio');
  }
  if (estado && !['activa', 'cancelada'].includes(estado)) {
    errores.push('El estado solo puede ser activa o cancelada; vencida se calcula automaticamente por fecha');
  }
  if (Number(monto) <= 0) errores.push('El monto debe ser mayor a 0');

  if (responderErrores(res, errores)) return;
  next();
};

const validarRutina = (req, res, next) => {
  const { cliente_id, entrenador_id, nombre, fecha_asignacion } = req.body;
  const errores = [];

  if (!cliente_id) errores.push('El cliente_id es obligatorio');
  if (!entrenador_id) errores.push('El entrenador_id es obligatorio');
  if (!nombre) errores.push('El nombre es obligatorio');
  if (!fecha_asignacion) errores.push('La fecha_asignacion es obligatoria');

  if (responderErrores(res, errores)) return;
  next();
};

const validarProgreso = (req, res, next) => {
  const { cliente_id, fecha_registro, peso, porcentaje_grasa } = req.body;
  const errores = [];

  if (!cliente_id) errores.push('El cliente_id es obligatorio');
  if (!fecha_registro) errores.push('La fecha_registro es obligatoria');
  if (peso !== undefined && peso !== null && Number(peso) < 0) errores.push('El peso no puede ser negativo');
  if (porcentaje_grasa !== undefined && porcentaje_grasa !== null && Number(porcentaje_grasa) < 0) {
    errores.push('El porcentaje_grasa no puede ser negativo');
  }

  if (responderErrores(res, errores)) return;
  next();
};

const validarMensaje = (req, res, next) => {
  const { nombre, correo, asunto, mensaje } = req.body;
  const errores = [];

  if (!nombre) errores.push('El nombre es obligatorio');
  if (!correo) errores.push('El correo es obligatorio');
  if (correo && !validarCorreo(correo)) errores.push('El correo no tiene un formato valido');
  if (!asunto) errores.push('El asunto es obligatorio');
  if (!mensaje) errores.push('El mensaje es obligatorio');

  if (responderErrores(res, errores)) return;
  next();
};

module.exports = {
  validarUsuario,
  validarMembresia,
  validarRutina,
  validarProgreso,
  validarMensaje,
  rolesPermitidos
};
