class AppError extends Error {
    constructor(message, statusCode, code = null) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;        // ex: 'ACCOUNT_BLOCKED', 'EMAIL_TAKEN'
        this.isOperational = true; // distingue erreur métier vs bug
    }
}

module.exports = AppError;