const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

// Configuration du pool de connexion PostgreSQL
const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL 
});

// Création de l'adaptateur pour Prisma 7
const adapter = new PrismaPg(pool);

// Initialisation du client avec l'adaptateur requis
const prisma = new PrismaClient({ adapter });

module.exports = prisma;