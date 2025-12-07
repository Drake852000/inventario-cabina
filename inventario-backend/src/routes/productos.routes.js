const router = require('express').Router();
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');
const ctrl = require('../controllers/productos.controller');

// Admin crea/edita, vendedor puede ver
router.post('/', auth, roles(['ADMIN']), ctrl.crearProducto);
router.get('/', auth, ctrl.listarProductos);

module.exports = router;
