const prisma = require('../lib/prisma');
const crypto = require('crypto');
const { comparePassword, hashPassword } = require('../utils/hash');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
const jwt = require('jsonwebtoken');

// Helper to hash the refresh token in DB
const hashToken = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
};

class AuthService {
    async register(userData) {
        const { nomComplet, email, password } = userData;

        // 1. Vérifier la limite d'administrateurs (Max 10)
        const userCount = await prisma.utilisateur.count();
        if (userCount >= 10) {
            throw new Error('La limite maximale de 10 administrateurs est atteinte.', 409);
        }

        // 2. Vérifier si l'utilisateur existe déjà
        const existingUser = await prisma.utilisateur.findUnique({ where: { email } });
        if (existingUser) {
            throw new Error('Cet email est déjà associé à un compte.', 409);
        }

        // 2. Hasher le mot de passe
        const hashedPassword = await hashPassword(password);

        // 3. Créer l'utilisateur (rôle LECTEUR par défaut)
        const user = await prisma.utilisateur.create({
            data: {
                nomComplet,
                email,
                motDePasse: hashedPassword,
                role: 'ADMIN',
                actif: true
            }
        });

        // 4. Retourner l'utilisateur sans le mot de passe
        return {
            id: user.id,
            nomComplet: user.nomComplet,
            email: user.email,
            role: user.role
        };
    }

    async login(email, password) {
        try {
            const user = await prisma.utilisateur.findUnique({ where: { email } });

            if (!user) {
                throw new Error('Identifiants invalides', 401);
            }

            if (!user.actif) {
                throw new Error('Compte désactivé', 403);
            }

            // Check if user is temporarily blocked
            if (user.bloqueJusqua && user.bloqueJusqua > new Date()) {
                throw new Error('Compte bloqué suite à trop de tentatives. Veuillez réessayer plus tard.', 429);
            }

            const isMatch = await comparePassword(password, user.motDePasse);

            if (!isMatch) {
                const tentatives = user.tentativesEchec + 1;
                let bloqueJusqua = user.bloqueJusqua;

                if (tentatives >= 5) {
                    // Block for 15 minutes
                    bloqueJusqua = new Date(Date.now() + 15 * 60 * 1000);
                }

                await prisma.utilisateur.update({
                    where: { id: user.id },
                    data: {
                        tentativesEchec: tentatives,
                        bloqueJusqua
                    }
                });

                throw new Error('Identifiants invalides');
            }

            // Success: generation of tokens
            const accessToken = generateAccessToken(user);
            const refreshToken = generateRefreshToken(user);
            const hashedRefreshToken = hashToken(refreshToken);

            // Update user state back to successful login
            // 'lastLogin' conceptual update (Prisma will automatically update 'updatedAt')
            await prisma.utilisateur.update({
                where: { id: user.id },
                data: {
                    tentativesEchec: 0,
                    bloqueJusqua: null,
                    refreshToken: hashedRefreshToken,
                    lastLogin: new Date()
                }
            });

            // Safe return
            const safeUser = {
                id: user.id,
                nomComplet: user.nomComplet,
                email: user.email,
                role: user.role,
                lastLogin: user.lastLogin
            };

            return { user: safeUser, accessToken, refreshToken };
        } catch (error) {
            throw new Error(error.message || 'Erreur lors de la connexion');
        }
    }

    async refreshToken(token) {
        try {
            // Verify token validity based on JWT signature and expiration
            const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'secret_refresh_temporaire');

            const user = await prisma.utilisateur.findUnique({ where: { id: decoded.id } });

            if (!user) {
                throw new Error('Utilisateur non trouvé', 401);
            }

            const hashedProvidedToken = hashToken(token);

            if (user.refreshToken !== hashedProvidedToken) {
                // Compromised token detection: Revoke ALL tokens to enforce a fresh login
                await prisma.utilisateur.update({
                    where: { id: user.id },
                    data: { refreshToken: null }
                });
                throw new Error('Token compromis, tous les accès ont été révoqués', 401);
            }

            // Valid refresh token -> Token Rotation
            const newAccessToken = generateAccessToken(user);
            const newRefreshToken = generateRefreshToken(user);
            const hashedNewRefreshToken = hashToken(newRefreshToken);

            await prisma.utilisateur.update({
                where: { id: user.id },
                data: { refreshToken: hashedNewRefreshToken }
            });

            return { accessToken: newAccessToken, refreshToken: newRefreshToken };

        } catch (error) {
            throw new Error(error.message || 'Token invalide ou expiré');
        }
    }
    async logout(userId) {
        try {
            const user = await prisma.utilisateur.update({
                where: { id: userId },
                data: { refreshToken: null }
            });
            return user;
        } catch (error) {
            throw new Error(error.message || 'Erreur lors de la déconnexion');
        }
    }
}

module.exports = new AuthService();
