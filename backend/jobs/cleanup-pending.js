const mediaService = require('../src/services/media.service');

async function nettoyerPendingExpires() {
  return mediaService.nettoyerPendingExpires();
}

module.exports = { nettoyerPendingExpires };
