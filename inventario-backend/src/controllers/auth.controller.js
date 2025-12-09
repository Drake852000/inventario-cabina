// src/controllers/auth.controller.js
const prisma = require('../prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const ACCESS_TOKEN_EXP = '1h';      // token de acceso dura 1 hora
const REFRESH_TOKEN_DIAS = 7;      // refresh token dura 7 días

function generarAccessToken(usuario) {
  return jwt.sign(
    {
      id: usuario.id,
      nombre: usuario.nombre,
      rol: usuario.rol.nombre
    },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXP }
  );
}

function generarRefreshToken() {
  return crypto.randomBytes(40).toString('hex');
}

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const usuario = await prisma.usuario.findUnique({
      where: { email },
      include: { rol: true }
    });

    if (!usuario) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    const valido = bcrypt.compareSync(password, usuario.password_hash);
    if (!valido) {
      return res.status(401).json({ msg: 'Contraseña incorrecta' });
    }

    // Generar tokens
    const accessToken = generarAccessToken(usuario);
    const refreshToken = generarRefreshToken();

    // Calcular expiración del refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_DIAS);

    // Guardar refresh token en BD
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        usuario: { connect: { id: usuario.id } },
        expiresAt
      }
    });

    res.json({
      accessToken,
      refreshToken,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol.nombre
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error en el login' });
  }
};

// REFRESH TOKEN
// body: { refreshToken }
exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ msg: 'refreshToken es requerido' });
    }

    const tokenDb = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { usuario: { include: { rol: true } } }
    });

    if (!tokenDb || tokenDb.revoked) {
      return res.status(401).json({ msg: 'Refresh token inválido' });
    }

    if (tokenDb.expiresAt < new Date()) {
      return res.status(401).json({ msg: 'Refresh token expirado' });
    }

    const usuario = tokenDb.usuario;

    // Opcional: rotar refresh token (mejor seguridad)
    const nuevoRefreshToken = generarRefreshToken();
    const nuevaExpiracion = new Date();
    nuevaExpiracion.setDate(nuevaExpiracion.getDate() + REFRESH_TOKEN_DIAS);

    // Revocar el anterior y crear uno nuevo
    await prisma.refreshToken.update({
      where: { id: tokenDb.id },
      data: { revoked: true }
    });

    await prisma.refreshToken.create({
      data: {
        token: nuevoRefreshToken,
        usuario: { connect: { id: usuario.id } },
        expiresAt: nuevaExpiracion
      }
    });

    const newAccessToken = generarAccessToken(usuario);

    res.json({
      accessToken: newAccessToken,
      refreshToken: nuevoRefreshToken
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al refrescar token' });
  }
};

// LOGOUT
// body: { refreshToken }
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ msg: 'refreshToken es requerido' });
    }

    await prisma.refreshToken.updateMany({
      where: { token: refreshToken },
      data: { revoked: true }
    });

    res.json({ msg: 'Sesión cerrada correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al cerrar sesión' });
  }
};

// OPCIONAL: para que el frontend valide quién está logueado
exports.me = async (req, res) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.user.id },
      include: { rol: true }
    });

    if (!usuario) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    res.json({
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol.nombre
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al obtener usuario' });
  }
};
