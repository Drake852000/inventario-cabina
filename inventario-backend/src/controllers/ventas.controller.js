const prisma = require('../prisma');

// body:
// {
//   items: [{ producto_id, cantidad, precio_unitario }],
//   metodo_pago: "EFECTIVO" | "YAPE" | "PLIN" | "OTRO",
//   cliente_nombre,
//   nota
// }
exports.crearVenta = async (req, res) => {
  const { items, metodo_pago, cliente_nombre, nota } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ msg: 'Items de venta requeridos' });
  }

  try {
    const resultado = await prisma.$transaction(async (tx) => {
      let total = 0;
      for (const item of items) {
        total += item.cantidad * item.precio_unitario;
      }

      const venta = await tx.venta.create({
        data: {
          total,
          metodo_pago,
          cliente_nombre,
          nota,
          usuario: { connect: { id: req.user.id } }
        }
      });

      for (const item of items) {
        const producto = await tx.producto.findUnique({
          where: { id: item.producto_id }
        });

        if (!producto) {
          throw new Error(`Producto ${item.producto_id} no existe`);
        }

        const stock_nuevo = producto.stock_actual - item.cantidad;
        if (stock_nuevo < 0) {
          throw new Error(`Stock insuficiente para ${producto.nombre}`);
        }

        // Detalle de venta
        await tx.ventaDetalle.create({
          data: {
            cantidad: item.cantidad,
            precio_unitario: item.precio_unitario,
            subtotal: item.cantidad * item.precio_unitario,
            venta: { connect: { id: venta.id } },
            producto: { connect: { id: item.producto_id } }
          }
        });

        // Actualizar stock
        await tx.producto.update({
          where: { id: item.producto_id },
          data: {
            stock_actual: stock_nuevo
          }
        });

        // Movimiento de inventario (SALIDA)
        await tx.movimientoInventario.create({
          data: {
            tipo: 'SALIDA',
            cantidad: item.cantidad,
            stock_anterior: producto.stock_actual,
            stock_nuevo,
            motivo: `Venta #${venta.id}`,
            producto: { connect: { id: item.producto_id } },
            usuario: { connect: { id: req.user.id } }
          }
        });
      }

      return venta;
    });

    res.status(201).json({ msg: 'Venta registrada', venta: resultado });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message || 'Error al registrar venta' });
  }
};
