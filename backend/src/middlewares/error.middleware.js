const errorHandler = (err, req, res, next) => {
    console.log('\n--- 🛑 ERREUR DÉTECTÉE ---');
    console.error(`📍 Route: ${req.method} ${req.url}`);
    console.error(`❗ Message: ${err.message}`);
    console.error(`🔍 Type: ${err.name}`);
    if (err.stack) console.error(err.stack);
    console.log('--------------------------\n');

    // Erreur CSRF
    if (err.code === 'EBADCSRFTOKEN' || err.message === 'invalid csrf token') {
        return res.status(403).json({
            success: false,
            message: 'Token CSRF invalide. Appelez GET /api/v1/csrf-token.',
        });
    }

    // Erreur Prisma - email/champ unique
    if (err.code === 'P2002') {
        return res.status(409).json({
            success: false,
            message: 'Cette valeur existe déjà.',
            field: err.meta?.target,
        });
    }

    // Erreur Prisma - enregistrement introuvable
    if (err.code === 'P2025') {
        return res.status(404).json({
            success: false,
            message: 'Ressource introuvable.',
        });
    }

    const statusCode = err.statusCode || 500;

    // Erreur opérationnelle (AppError) → message lisible pour le client
    if (err.isOperational) {
        return res.status(statusCode).json({
            success: false,
            message: err.message,
            ...(err.code && { code: err.code }),
        });
    }

    // Bug inattendu → message générique en prod, détails en dev
    const isDev = process.env.NODE_ENV !== 'production';
    return res.status(500).json({
        success: false,
        message: isDev ? err.message : 'Une erreur interne est survenue.',
        ...(isDev && { stack: err.stack }),
    });
};

module.exports = errorHandler;