const express = require('express');
const passwordController = require('../controllers/password.controller');
const { forgotPasswordLimiter, resetPasswordLimiter } = require('../config/security');
const validate = require('../validators/validate');
const { forgotPasswordSchema, resetPasswordSchema } = require('../validators/authvalidate');

const router = express.Router();

// Rate limiting (3/min) : anti-spam SMTP et anti-énumération email
router.post('/forgot-password', forgotPasswordLimiter, validate(forgotPasswordSchema), passwordController.forgotPassword);

// Rate limiting (5/min) : défense en profondeur même si brute-force infaisable en pratique
router.post('/reset-password', resetPasswordLimiter, validate(resetPasswordSchema), passwordController.resetPassword);

module.exports = router;
