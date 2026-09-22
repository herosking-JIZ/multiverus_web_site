const passwordService = require('../services/password.service');
const prisma = require('../lib/prisma');

const logAction = async (req, userId, action, detail) => {
    try {
        await prisma.auditLog.create({
            data: {
                utilisateurId: userId,
                action: action,
                entiteCible: 'UTILISATEUR',
                entiteId: userId, // L'entité ciblée est l'utilisateur lui-même
                detail: { ...detail, ip: req.ip, userAgent: req.get('User-Agent') }
            }
        });
    } catch (err) { }
};

class PasswordController {
    async forgotPassword(req, res, next) {
        try {
            const { email } = req.body;

            await passwordService.requestPasswordReset(email);

            return res.status(200).json({
                success: true,
                message: 'Si cette adresse e-mail correspond à un compte actif, un lien de réinitialisation a été envoyé.'
            });
        } catch (error) {
            next(error);
        }
    }

    async resetPassword(req, res, next) {
        try {
            const { token, motDePasse } = req.body;

            // On modifie l'appel pour récupérer l'ID
            const userId = await passwordService.resetPassword(token, motDePasse);

            // LOG Audit
            if (userId) {
                await logAction(req, userId, 'RESET_PASSWORD', { success: true });
            }

            return res.status(200).json({
                success: true,
                message: 'Votre mot de passe a été réinitialisé avec succès.'
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new PasswordController();
