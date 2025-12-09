const prisma = require('../prisma');
const bcrypt = require('bcryptjs');
const { esPasswordFuerte } = require('../utils/password'); // 👈 asegúrate de tener este helper

// =============================
//   CREAR USUARIO (solo admin)
// =============================
exports.crearUsuario = async (req, res) => {
  try {
    const { nombre, email, password, rol_id } = req.body;

    // Validar campos requeridos
    if (!nombre || !email || !password || !rol_id) {
      return res.status(400).json({ msg: 'Todos los campos son obligatorios' });
    }

    // Validar fuerza de contraseña
    if (!esPasswordFuerte(password)) {
      return res.status(400).json({
        msg: 'La contraseña es débil. Debe tener mínimo 8 caracteres, mayúscula, minúscula, número y símbolo.'
      });
    }

    // Verificar si el email ya existe
    const emailExiste = await prisma.usuario.findUnique({ where: { email } });
    if (emailExiste) {
      return res.status(400).json({ msg: 'El email ya está registrado' });
    }

    // Verificar si el rol existe
    const rolExiste = await prisma.rol.findUnique({ where: { id: rol_id } });
    if (!rolExiste) {
      return res.status(400).json({ msg: 'El rol especificado no existe' });
    }

    // Encriptar contraseña
    const password_hash = bcrypt.hashSync(password, 10);

    // Crear usuario
    const nuevo = await prisma.usuario.create({
      data: {
        nombre,
        email,
        password_hash,
        rol: { connect: { id: rol_id } }
      }
    });

    res.status(201).json({
      msg: 'Usuario creado correctamente',
      usuario: {
        id: nuevo.id,
        nombre: nuevo.nombre,
        email: nuevo.email,
        rol_id: nuevo.rol_id
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al crear usuario' });
  }
};


// =============================
//        LISTAR USUARIOS
// =============================
exports.listarUsuarios = async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nombre: true,
        email: true,
        activo: true,
        rol: { select: { nombre: true } },
        creado_en: true
      },
      orderBy: { id: 'asc' }
    });

    res.json(usuarios);

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al listar usuarios' });
  }
};

