const bcrypt = require('bcrypt');

/**
 * Hash a password using bcrypt with a cost of 12 (as specified).
 * @param {string} password 
 * @returns {Promise<string>}
 */
const hashPassword = async (password) => {
    return await bcrypt.hash(password, 12);
};

/**
 * Compare a plain text password with a hashed version.
 * @param {string} password 
 * @param {string} hash 
 * @returns {Promise<boolean>}
 */
const comparePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};

module.exports = {
    hashPassword,
    comparePassword
};
