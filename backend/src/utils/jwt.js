const jwt = require('jsonwebtoken');

/**
 * Generate a short-lived access token (15 mins)
 * @param {Object} user 
 * @returns {string}
 */
const generateAccessToken = (user) => {
    return jwt.sign(
        { id: user.id, role: user.role, email: user.email },
        process.env.JWT_ACCESS_SECRET || 'secret_access_temporaire',
        { expiresIn: '1d' }
    );
};

/**
 * Generate a long-lived refresh token (7 days)
 * @param {Object} user 
 * @returns {string}
 */
const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user.id },
        process.env.JWT_REFRESH_SECRET || 'secret_refresh_temporaire',
        { expiresIn: '1d' }
    );
};

module.exports = {
    generateAccessToken,
    generateRefreshToken
};
