const prisma = require('../prisma');

exports.crearCategoria = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;

    const categoria = await prisma.categoria.create({
      data: { nombre, descripcion }
    });

    res.status(201).json(categoria);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al crear categoría' });
  }
};

exports.listarCategorias = async (req, res) => {
  try {
    const categorias = await prisma.categoria.findMany({
      where: { activo: true }
    });
    res.json(categorias);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al listar categorías' });
  }
};
