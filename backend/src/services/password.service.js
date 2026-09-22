const prisma = require('../lib/prisma');
const crypto = require('crypto');
const mailService = require('./mail.service');
const { hashPassword } = require('../utils/hash');
const AppError = require('../utils/appError');

const hashToken = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
};

class PasswordService {
    async requestPasswordReset(email) {
        const user = await prisma.utilisateur.findUnique({ where: { email } });

        // SÉCURITÉ : réponse neutre si le compte n'existe pas (anti-énumération email)
        if (!user) {
            return { success: true };
        }

        const resetToken = crypto.randomBytes(32).toString('hex');

        // Log uniquement en développement, jamais en production
        if (process.env.NODE_ENV !== 'production') {
            console.log('[RESET TOKEN DEV - NE PAS ACTIVER EN PROD]', resetToken);
        }

        const hashedToken = hashToken(resetToken);
        const tokenExpiration = new Date(Date.now() + 15 * 60 * 1000);

        // Étape 1 : sauvegarder le token — si ça échoue, on propage l'erreur
        // (le middleware error gère le 500 sans exposer les détails)
        await prisma.utilisateur.update({
            where: { id: user.id },
            data: {
                resetPasswordToken: hashedToken,
                resetPasswordExpires: tokenExpiration,
            },
        });

        // Étape 2 : envoyer l'email — erreur non-fatale, on log mais on ne bloque pas
        // Le token est déjà en base, l'utilisateur peut redemander si besoin.
        const sent = await mailService.sendPasswordResetEmail(email, resetToken);
        if (!sent) {
            console.error(`[PasswordService] Email non envoyé pour userId=${user.id}`);
        }

        return { success: true };
    }

    async resetPassword(token, newPassword) {
        const hashedToken = hashToken(token);

        const user = await prisma.utilisateur.findFirst({
            where: {
                resetPasswordToken: hashedToken,
                resetPasswordExpires: {
                    gt: new Date(),
                },
            },
        });

        // Utilise AppError pour que le middleware retourne le bon message (400) en production
        if (!user) {
            throw new AppError('Le lien de réinitialisation est invalide ou a expiré.', 400, 'INVALID_RESET_TOKEN');
        }

        const newHashedPassword = await hashPassword(newPassword);

        // Mise à jour mot de passe + invalidation token + invalidation toutes les sessions
        await prisma.utilisateur.update({
            where: { id: user.id },
            data: {
                motDePasse: newHashedPassword,
                resetPasswordToken: null,
                resetPasswordExpires: null,
                refreshToken: null,
            },
        });

        return user.id;
    }
}

module.exports = new PasswordService();
