const jwt = require('jsonwebtoken');

/**
 * Generate a short-lived access token (15 mins)
 * @param {Object} user 
 * @returns {string}
 */
const generateAccessToken = (user) => {
    const secret = process.env.JWT_ACCESS_SECRET || (process.env.NODE_ENV === 'production' ? null : 'secret_access_temporaire');
    if (!secret) throw new Error('JWT_ACCESS_SECRET manquant en production');
    return jwt.sign(
        { id: user.id, role: user.role, email: user.email },
        secret,
        { expiresIn: '1d' }
    );
};

/**
 * Generate a long-lived refresh token (7 days)
 * @param {Object} user 
 * @returns {string}
 */
const generateRefreshToken = (user) => {
    const secret = process.env.JWT_REFRESH_SECRET || (process.env.NODE_ENV === 'production' ? null : 'secret_refresh_temporaire');
    if (!secret) throw new Error('JWT_REFRESH_SECRET manquant en production');
    return jwt.sign(
        { id: user.id },
        secret,
        { expiresIn: '7d' }
    );
};

module.exports = {
    generateAccessToken,
    generateRefreshToken
};
