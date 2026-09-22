require('dotenv').config();
const app = require('./app');
const prisma = require('./src/lib/prisma');
require('./jobs');

const PORT = process.env.PORT || 8080;

let server;

// Test de connexion avant d'écouter les requêtes
async function startServer() {
    try {
        await prisma.$connect();
        console.log('✅ Base de données connectée avec succès.');

        server = app.listen(PORT, () => {
            console.log(`🚀 Serveur [${process.env.NODE_ENV || 'développement'}] démarré sur http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Échec de la connexion à la base de données :', error);
        process.exit(1);
    }
}

// Interception pour fermeture "Graceful Shutdown"
const shutdownHandler = async (signal) => {
    console.log(`\n🛑 Signal ${signal} reçu. Arrêt gracieux en cours...`);

    if (server) {
        server.close(async () => {
            console.log('HTTP server closed.');
            await prisma.$disconnect();
            console.log('✅ Connexion base de données stoppée proprement.');
            process.exit(0);
        });
    } else {
        await prisma.$disconnect();
        process.exit(0);
    }

    // Sécurité : Forcer l'arrêt après 10s si blocage
    setTimeout(() => {
        console.error('Forçage de l\'arrêt après délai d\'attente.');
        process.exit(1);
    }, 10000);
};

// Listeners Systèmes
process.on('SIGTERM', () => shutdownHandler('SIGTERM'));
process.on('SIGINT', () => shutdownHandler('SIGINT'));

startServer();
