const cron = require('node-cron');
const { nettoyerPendingExpires } = require('./cleanup-pending');

// Toutes les heures : supprime les médias PENDING expirés et leurs fichiers locaux
cron.schedule('0 * * * *', async () => {
  try {
    await nettoyerPendingExpires();
  } catch (err) {
    console.error('[cleanup] Erreur lors du nettoyage des médias PENDING :', err);
  }
});

console.log('[jobs] Cron de nettoyage des médias PENDING démarré (toutes les heures).');
