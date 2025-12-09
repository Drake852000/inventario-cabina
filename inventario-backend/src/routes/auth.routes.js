// src/routes/auth.routes.js
const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const authCtrl = require('../controllers/auth.controller');

router.post('/login', authCtrl.login);
router.post('/refresh', authCtrl.refresh);
router.post('/logout', authCtrl.logout);
router.get('/me', authMiddleware, authCtrl.me);

module.exports = router;
