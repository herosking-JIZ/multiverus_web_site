const express = require('express');
const validate = require('../validators/validate');
const authController = require('../controllers/auth.controller');
const verifyToken = require('../middlewares/auth.middleware');
const { generateToken } = require('../lib/csrf');
const { registerSchema, loginSchema, refreshTokenSchema } = require('../validators/authvalidate');

const router = express.Router();

// 🔓 ROUTES PUBLIQUES
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh-token', validate(refreshTokenSchema), authController.refreshToken);

// Récupération du jeton CSRF (nécessaire pour les méthodes POST/PATCH/DELETE)
router.get('/csrf-token', (req, res) => {
    const token = generateToken(req, res);
    res.json({ success: true, csrfToken: token });
});

// 🔐 ROUTES PROTÉGÉES (CSRF requis car elles modifient l'état de session)
router.post('/logout', verifyToken, authController.logout);
router.post('/logout-global', verifyToken, authController.logoutGlobal);

module.exports = router;
