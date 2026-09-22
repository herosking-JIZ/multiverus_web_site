const { doubleCsrf } = require('csrf-csrf');

const {
    invalidCsrfTokenError,
    generateCsrfToken,
    doubleCsrfProtection,
} = doubleCsrf({
    getSecret: (req) => req.secret || process.env.CSRF_SECRET || 'secret_de_secours_tres_long_et_aleatoire',
    getSessionIdentifier: (req) => req.user?.id || 'guest', // Lie le token à l'user ou à un invité
    cookieName: 'ps-csrf-token',
    cookieOptions: {
        httpOnly: false,
        sameSite: 'Lax',
        secure: process.env.NODE_ENV === 'production',
    },
    size: 64,
    ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
    getTokenFromRequest: (req) => req.headers['x-csrf-token'],
});

module.exports = {
    generateToken: generateCsrfToken, // On l'exporte sous le nom 'generateToken' pour la compatibilité
    doubleCsrfProtection,
    invalidCsrfTokenError
};
