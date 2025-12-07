const prisma = require('../prisma');

exports.crearProducto = async (req, res) => {
  try {
    const {
      nombre,
      categoria_id,
      descripcion,
      precio_costo,
      precio_venta,
      stock_actual,
      stock_minimo
    } = req.body;

    const producto = await prisma.producto.create({
      data: {
        nombre,
        descripcion,
        precio_costo,
        precio_venta,
        stock_actual,
        stock_minimo,
        categoria: categoria_id ? { connect: { id: categoria_id } } : undefined
      }
    });

    res.status(201).json(producto);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al crear producto' });
  }
};

exports.listarProductos = async (req, res) => {
  try {
    const productos = await prisma.producto.findMany({
      include: { categoria: true }
    });
    res.json(productos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al listar productos' });
  }
};
