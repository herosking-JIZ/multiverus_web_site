/**
 * Middleware d'autorisation Admin
 * Vérifie simplement si l'utilisateur possède le rôle ADMIN.
 */
const isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(403).json({ 
            success: false, 
            message: 'Accès refusé : privilèges Administrateur requis.' 
        });
    }

    next();
};

module.exports = isAdmin;
