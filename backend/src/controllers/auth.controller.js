const authService = require('../services/auth.service');
const prisma = require('../lib/prisma');

// Outil interne pour créer une trace d'audit pour le backend
const logAction = async (req, userId, action, cible, detail) => {
    try {
        await prisma.auditLog.create({
            data: {
                utilisateurId: userId,
                action: action,
                entiteCible: cible,
                entiteId: userId,
                detail: { ...detail, ip: req.ip, userAgent: req.get('User-Agent') }
            }
        });
    } catch (err) {
        // Silencieux en cas de fail d'audit pour ne pas bloquer l'user
        console.error('AuditLog error:', err);
    }
};

class AuthController {
    async register(req, res, next) {
        try {
            const { nomComplet, email, password } = req.body;

            const user = await authService.register({ nomComplet, email, password });

            return res.status(201).json({
                success: true,
                message: 'Utilisateur enregistré avec succès',
                data: user
            });
        } catch (error) {
            next(error);
        }
    }

    async login(req, res, next) {
        try {
            const { email, password } = req.body;

            const data = await authService.login(email, password);

            // SÉCURITÉ : Refresh Token en HTTP-ONLY Cookie
            res.cookie('refreshToken', data.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
            });

            // LOG DB : Connexion
            await logAction(req, data.user.id, 'LOGIN', 'UTILISATEUR', { status: 'success' });

            return res.status(200).json({
                success: true,
                message: 'Connexion réussie',
                data: {
                    user: data.user,
                    accessToken: data.accessToken // Pas de refresh token renvoyé en JSON
                }
            });
        } catch (error) {
            return res.status(401).json({ success: false, message: 'Identifiants invalides' });
        }
    }

    async refreshToken(req, res, next) {
        try {
            // Lecture exclusive depuis les cookies sécurisés
            const refreshToken = req.cookies.refreshToken;

            const data = await authService.refreshToken(refreshToken);

            // Set the new rotated refresh token 
            res.cookie('refreshToken', data.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            return res.status(200).json({
                success: true,
                message: 'Token rafraîchi',
                data: { accessToken: data.accessToken }
            });
        } catch (error) {
            return res.status(401).json({ success: false, message: 'Token invalide ou expiré' });
        }
    }

    async logout(req, res, next) {
        try {
            const userid = req.user.id;
            const data = await authService.logout(userid);
            if (!data) {
                return res.status(401).json({ success: false, message: 'Déconnexion échouée' });
            }
            // On efface le cookie côté front
            res.clearCookie('refreshToken', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Strict'
            });

            await logAction(req, req.user.id, 'LOGOUT', 'UTILISATEUR', {});

            return res.status(200).json({ success: true, message: 'Déconnexion réussie' });
        } catch (error) {
            next(error);
        }
    }

    async logoutGlobal(req, res, next) {
        try {
            await prisma.utilisateur.update({
                where: { id: req.user.id },
                data: { refreshToken: null }
            });

            res.clearCookie('refreshToken', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Strict'
            });

            await logAction(req, req.user.id, 'LOGOUT_GLOBAL', 'UTILISATEUR', { info: "Toutes sessions détruites" });

            return res.status(200).json({ success: true, message: 'Déconnexion globale réussie.' });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AuthController();
