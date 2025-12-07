const router = require('express').Router();
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');
const ctrl = require('../controllers/ventas.controller');

// Vendedor y admin pueden vender
router.post('/', auth, roles(['ADMIN', 'VENDEDOR']), ctrl.crearVenta);

module.exports = router;
