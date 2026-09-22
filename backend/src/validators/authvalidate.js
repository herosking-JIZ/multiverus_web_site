const Joi = require('joi');

// --- Règles réutilisables ---

const email = Joi.string()
    .email({ tlds: { allow: false } })
    .max(200)
    .lowercase()
    .trim();

const motDePasse = Joi.string()
    .min(8)
    .max(255)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/)
    .messages({
        'string.pattern.base': 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial',
        'string.min': 'Le mot de passe doit contenir au moins 8 caractères',
    });

// --- Login ---

const loginSchema = Joi.object({
    email: email.required(),
    password: motDePasse.required(),
});

// --- Création de compte ---

const registerSchema = Joi.object({
    nomComplet: Joi.string().min(2).max(200).trim().required(),
    email: email.required(),
    password: motDePasse.required(),
});

// --- Mot de passe oublié ---

const forgotPasswordSchema = Joi.object({
    email: email.required(),
});

// --- Réinitialisation du mot de passe ---

const resetPasswordSchema = Joi.object({
    token: Joi.string().trim().required(),
    motDePasse: motDePasse.required(),
    confirmMotDePasse: Joi.valid(Joi.ref('motDePasse')).required().messages({
        'any.only': 'Les mots de passe ne correspondent pas',
    }),
});

const refreshTokenSchema = Joi.object({
    refreshToken: Joi.string().required(),
});

module.exports = {
    loginSchema,
    registerSchema,
    forgotPasswordSchema,
    refreshTokenSchema,
    resetPasswordSchema,
};