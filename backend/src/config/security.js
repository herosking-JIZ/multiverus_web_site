const rateLimit = require('express-rate-limit');

// Limiteur pour prévenir le brute-force sur /login
const loginLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // Limite à 5 requêtes par adresse IP par windowMs
    message: { success: false, message: 'Trop de tentatives de connexion, veuillez patienter une minute.' },
    standardHeaders: true, // Retourne les infos de limite via les headers `RateLimit-*`
    legacyHeaders: false,
});

// Limiteur pour prévenir l'énumération par email (spam)
const forgotPasswordLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 3, // Limite à 3 requêtes (strict) par adresse IP
    message: { success: false, message: 'Trop de requêtes de réinitialisation, veuillez patienter une minute.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Limiteur pour /reset-password (défense en profondeur)
const resetPasswordLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    message: { success: false, message: 'Trop de tentatives, veuillez patienter une minute.' },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    loginLimiter,
    forgotPasswordLimiter,
    resetPasswordLimiter,
};
