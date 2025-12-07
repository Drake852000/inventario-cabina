const router = require('express').Router();
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');
const ctrl = require('../controllers/categorias.controller');

router.post('/', auth, roles(['ADMIN']), ctrl.crearCategoria);
router.get('/', auth, ctrl.listarCategorias);

module.exports = router;
