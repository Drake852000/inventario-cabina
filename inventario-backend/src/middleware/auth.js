const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const header = req.headers['authorization'];

  // No se envió header Authorization
  if (!header) {
    return res.status(401).json({ msg: 'Token no proporcionado' });
  }

  // Formato esperado: "Bearer TOKENAQUÍ"
  const parts = header.split(' ');

  if (parts.length !== 2) {
    return res.status(401).json({ msg: 'Formato de autorización inválido' });
  }

  const [scheme, token] = parts;

  // Validar que empiece con "Bearer"
  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ msg: 'Token debe usar esquema Bearer' });
  }

  if (!token) {
    return res.status(401).json({ msg: 'Token vacío o no válido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Guardamos la info del usuario en request
    req.user = decoded;   // { id, nombre, rol }

    next();
  } catch (err) {
    return res.status(401).json({ msg: 'Token inválido o expirado' });
  }
};
