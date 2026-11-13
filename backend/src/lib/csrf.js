const { doubleCsrf } = require('csrf-csrf');

const isProd = process.env.NODE_ENV === 'production';
const sameSiteSetting = process.env.COOKIE_SAMESITE || (isProd ? 'None' : 'Lax');
// En HTTPS avec SameSite=None, Secure doit obligatoirement être true
const secureSetting = sameSiteSetting === 'None' || isProd || process.env.COOKIE_SECURE === 'true';

const {
    invalidCsrfTokenError,
    generateCsrfToken,
    doubleCsrfProtection,
} = doubleCsrf({
    getSecret: (req) => req.secret || process.env.CSRF_SECRET || 'secret_de_secours_tres_long_et_aleatoire',
    getSessionIdentifier: (req) => req.user?.id || 'guest',
    cookieName: 'ps-csrf-token',
    cookieOptions: {
        httpOnly: false,
        sameSite: sameSiteSetting,
        secure: secureSetting,
        domain: process.env.COOKIE_DOMAIN || undefined,
    },
    size: 64,
    ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
    getTokenFromRequest: (req) => req.headers['x-csrf-token'] || req.headers['X-CSRF-TOKEN'],
});

module.exports = {
    generateToken: generateCsrfToken,
    doubleCsrfProtection,
    invalidCsrfTokenError,
};
