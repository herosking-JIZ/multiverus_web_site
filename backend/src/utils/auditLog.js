const prisma = require('../lib/prisma');

/**
 * Crée une entrée d'audit dans la base de données.
 * Silencieux en cas d'erreur pour ne pas bloquer la requête principale.
 *
 * @param {Object} req - Requête Express (pour IP et User-Agent)
 * @param {string} userId - ID de l'administrateur
 * @param {string} action - Ex: CREATE_SERVICE, UPDATE_LEAD, DELETE_MEDIA
 * @param {string} entiteCible - Ex: SERVICE, PRODUIT, LEAD
 * @param {string|null} entiteId - ID de l'entité concernée
 * @param {Object} detail - Données additionnelles
 */
const logAction = async (req, userId, action, entiteCible, entiteId = null, detail = {}) => {
  try {
    await prisma.auditLog.create({
      data: {
        utilisateurId: userId,
        action,
        entiteCible,
        entiteId: entiteId ? String(entiteId) : null,
        detail: {
          ...detail,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
        },
      },
    });
  } catch (err) {
    console.error('[AuditLog] Erreur :', err.message);
  }
};

module.exports = logAction;
