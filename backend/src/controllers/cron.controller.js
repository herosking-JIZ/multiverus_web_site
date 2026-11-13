const mediaService = require('../services/media.service');

class CronController {
  /**
   * Nettoie les uploads PENDING expirés (fichiers locaux ou S3/R2).
   * Appelé périodiquement par Vercel Cron (GET) ou par un scheduler externe.
   */
  async cleanupPendingUploads(req, res, next) {
    try {
      // Sécurité : si un CRON_SECRET est défini dans l'environnement, on valide l'en-tête
      const cronSecret = process.env.CRON_SECRET;
      const authHeader = req.headers['authorization'];

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

