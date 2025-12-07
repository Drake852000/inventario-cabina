const prisma = require('../prisma');
const bcrypt = require('bcryptjs');

exports.crearUsuario = async (req, res) => {
  try {
    const { nombre, email, password, rol_id } = req.body;

    const password_hash = bcrypt.hashSync(password, 10);

    const nuevo = await prisma.usuario.create({
      data: {
        nombre,
        email,
        password_hash,
        rol: { connect: { id: rol_id } }
      }
    });

    res.status(201).json({ msg: 'Usuario creado', id: nuevo.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al crear usuario' });
  }
};

exports.listarUsuarios = async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nombre: true,
        email: true,
        activo: true,
        rol: { select: { nombre: true } }
      }
    });
    res.json(usuarios);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al listar usuarios' });
  }
};
