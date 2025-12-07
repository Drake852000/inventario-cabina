const router = require('express').Router();
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');
const ctrl = require('../controllers/usuarios.controller');

// Solo admin puede gestionar usuarios
router.post('/', auth, roles(['ADMIN']), ctrl.crearUsuario);
router.get('/', auth, roles(['ADMIN']), ctrl.listarUsuarios);

module.exports = router;
