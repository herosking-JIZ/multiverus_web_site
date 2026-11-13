const cron = require('node-cron');
const { nettoyerPendingExpires } = require('./cleanup-pending');

// Ne démarre le cron en mémoire que si l'on n'est pas dans un environnement Serverless (Vercel / Netlify / AWS Lambda)
// car en Serverless, les tâches doivent être déclenchées via les Vercel Cron Jobs (route /api/v1/cron/cleanup-pending).
if (!process.env.VERCEL && !process.env.NETLIFY && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  cron.schedule('0 * * * *', async () => {
    try {
      await nettoyerPendingExpires();
    } catch (err) {
      console.error('[cleanup] Erreur lors du nettoyage des médias PENDING :', err);
    }
  });

  console.log('[jobs] Cron de nettoyage des médias PENDING démarré (toutes les heures en local/VPS).');
} else {
  console.log('[jobs] Environnement Serverless détecté : cron en mémoire désactivé au profit des Vercel/Netlify Crons.');
}
