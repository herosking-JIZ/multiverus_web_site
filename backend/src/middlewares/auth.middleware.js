const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
            success: false, 
            message: "Non autorisé : token d'accès manquant ou format invalide" 
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const jwtSecret = process.env.JWT_ACCESS_SECRET || (process.env.NODE_ENV === 'production' ? null : 'secret_access_temporaire');
        if (!jwtSecret) {
            console.error('❌ [SÉCURITÉ CRITIQUE] JWT_ACCESS_SECRET n\'est pas défini dans l\'environnement de production.');
            return res.status(500).json({ success: false, message: 'Erreur de configuration de sécurité du serveur' });
        }

        const decoded = jwt.verify(token, jwtSecret);
        
        // On injecte les données décodées (ex: { id, role, email }) dans l'objet req
        req.user = decoded; 
        
        next();
    } catch (error) {
        console.error('Erreur de vérification du token :', error);
        return res.status(401).json({ 
            success: false, 
            message: 'Non autorisé : token invalide ou expiré' 
        });
    }
};

module.exports = verifyToken;
