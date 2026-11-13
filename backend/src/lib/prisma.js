const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

// En environnement serverless (Vercel, AWS Lambda, etc.) ou en développement avec HMR,
// chaque invocation ou rechargement peut réinstancier les modules Node.js.
// Stocker l'instance sur globalThis évite d'ouvrir de nouveaux pools de connexions
// à chaque requête, ce qui saturerait rapidement PostgreSQL.
const globalForPrisma = globalThis;

if (!globalForPrisma.prisma) {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        // Limiter la taille du pool en serverless (configurable selon le pooler Neon / Supabase)
        max: process.env.PG_MAX_POOL_SIZE ? parseInt(process.env.PG_MAX_POOL_SIZE, 10) : 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
    });

    const adapter = new PrismaPg(pool);
    globalForPrisma.prisma = new PrismaClient({ adapter });
}

module.exports = globalForPrisma.prisma;
