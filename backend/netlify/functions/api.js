// Point d'entrée pour le déploiement Netlify Functions
const serverless = require('serverless-http');
const app = require('../../app');

module.exports.handler = serverless(app);

