const mediaService = require('../services/media.service');

class CronController {
  /**
   * Nettoie les uploads PENDING expirés (fichiers locaux ou S3/R2).
   * Appelé périodiquement par Vercel Cron (GET) ou par un scheduler externe.
   */
  async cleanupPendingUploads(req, res, next) {
    try {
      // Sécurité : validation stricte du jeton CRON_SECRET
      const cronSecret = process.env.CRON_SECRET;
      const authHeader = req.headers['authorization'];
      const isProd = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

      if (isProd && !cronSecret) {
        return res.status(500).json({
          success: false,
          message: 'CRON_SECRET non configuré sur le serveur en production.',
        });
      }

      if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return res.status(401).json({
          success: false,
          message: 'Accès refusé : jeton CRON_SECRET manquant ou invalide.',
        });
      }

      console.log('⏰ [CRON] Début du nettoyage des médias PENDING expirés...');
      const deletedCount = await mediaService.nettoyerPendingExpires();

      return res.status(200).json({
        success: true,
        message: `${deletedCount} média(s) PENDING expiré(s) nettoyé(s).`,
        deletedCount,
        executedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('❌ [CRON] Échec du nettoyage :', err);
      next(err);
    }
  }
}

module.exports = new CronController();

