const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const router = require('./src/routes/route');
const errorHandler = require('./src/middlewares/error.middleware');
const AppError = require('./src/utils/appError');
const { doubleCsrfProtection, generateToken } = require('./src/lib/csrf');
console.log('FRONTEND_URL', process.env.FRONTEND_URL);
const app = express();
app.set('trust proxy', 1);
// Prisma retourne parfois des BigInt (count, ordre...) que JSON.stringify ne gère pas nativement
app.set('json replacer', (_key, value) =>
    typeof value === 'bigint' ? Number(value) : value
);

// ==========================================
// MIDDLEWARE DE LOGS GLOBAL (Inclut les routes publiques comme /uploads)
// ==========================================
app.use((req, res, next) => {
    const start = Date.now();
    console.log(`\n🌍 [REQ] ${req.method} ${req.originalUrl} - Début de la requête`);

    // Intercepter la fin de la réponse pour l'afficher
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`✅ [RES] ${req.method} ${req.originalUrl} - Statut: ${res.statusCode} - Temps: ${duration}ms`);
    });

    next();
});

// ==========================================
// FICHIERS STATIQUES — dossier uploads
// (en production, Nginx sert /uploads directement sans passer par Node.js)
// ==========================================
const uploadsDir = process.env.MEDIA_STORAGE_PATH
    ? path.resolve(process.env.MEDIA_STORAGE_PATH)
    : path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsDir));

// Configuration CORS avancée (multi-environnements & Serverless)
const configuredFrontendUrls = (process.env.FRONTEND_URL || '')
    .split(',')
    .map(url => url.trim().replace(/\/$/, ''))
    .filter(Boolean);

const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    'http://100.119.90.39:3000',
    'http://100.119.90.39:5173',
    'http://100.119.90.39',
    ...configuredFrontendUrls,
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Requêtes serveur-à-serveur, curl, Vercel Crons ou origines autorisées
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        // Autoriser dynamiquement les ports localhost en développement
        if (process.env.NODE_ENV !== 'production' && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) {
            return callback(null, true);
        }
        // Autoriser les déploiements de prévisualisation Vercel (*.vercel.app)
        if ((process.env.ALLOW_VERCEL_PREVIEWS === 'true' || process.env.NODE_ENV !== 'production') && origin.endsWith('.vercel.app')) {
            return callback(null, true);
        }
        callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true, // indispensable pour les cookies CSRF et RefreshToken
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token', 'X-CSRF-TOKEN', 'Accept', 'x-requested-with'],
}));

app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// ==========================================
// 0. LOGGING DES REQUÊTES (TERMINAL)
// ==========================================
// Morgan affiche : METHOD URL STATUS TIME
app.use(morgan('dev'));


// ==========================================
// 1. DÉCODAGE PAYLOAD (AVANT LOGGING)
// ==========================================
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use(cookieParser(process.env.COOKIE_SECRET || 'secret_de_secours_cookies'));





// Middleware personnalisé pour voir le contenu des requêtes (Payload)
app.use((req, res, next) => {
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('📦 Body:', JSON.stringify(req.body, null, 2));
    }
    next();
});


const globalApiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { success: false, message: "Délai d'attente dépassé" }
});

app.use('/api/v1', globalApiLimiter);

// Route publique CSRF — doit être AVANT le middleware de protection
app.get('/api/v1/csrf-token', (req, res) => {
    const token = generateToken(req, res);
    console.log('CSRF Token:', token);
    res.json({ success: true, csrfToken: token });
});

// Route publique de diagnostic et santé (vérifie la connexion à la base de données)
app.get('/api/v1/health', async (req, res) => {
    try {
        const prismaClient = require('./src/lib/prisma');
        // Test réel de communication SQL
        await prismaClient.$queryRaw`SELECT 1 as connected`;

        // Compter les tables dans le schéma public
        const tables = await prismaClient.$queryRaw`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        `;

        return res.status(200).json({
            success: true,
            status: 'healthy',
            database: {
                connected: true,
                tablesCount: tables.length,
                tables: tables.map(t => t.table_name),
            },
            uptime: Math.floor(process.uptime()),
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        return res.status(503).json({
            success: false,
            status: 'unhealthy',
            database: {
                connected: false,
                error: error.message
            },
            timestamp: new Date().toISOString()
        });
    }
});

// Debug CSRF — affiche le token reçu vs le cookie présent (dev uniquement)
if (process.env.NODE_ENV !== 'production') {
    app.use((req, _res, next) => {
        const mutating = ['POST', 'PUT', 'PATCH', 'DELETE'];
        if (mutating.includes(req.method)) {
            const headerToken = req.headers['x-csrf-token'];
            const cookieToken = req.cookies?.['ps-csrf-token'];
            console.log(`\n🔐 CSRF DEBUG [${req.method} ${req.path}]`);
            console.log(`   Header x-csrf-token : ${headerToken ?? '⛔ absent'}`);
            console.log(`   Cookie ps-csrf-token: ${cookieToken ?? '⛔ absent'}`);
        }
        next();
    });
}

// Route d'accueil / racine (évite le 404 lors du test de l'URL de base)
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Bienvenue sur l\'API MultiVerus',
        version: 'v1',
        endpoints: {
            csrfToken: 'GET /api/v1/csrf-token',
            health: 'GET /api/v1/health',
            baseApi: '/api/v1'
        }
    });
});

// Protection CSRF globale (après la route publique)
app.use(doubleCsrfProtection);

// Routes API
app.use('/api/v1', router);

// Middleware 404 - Route non trouvée
app.use((req, res, next) => {
    next(new AppError(`La ressource demandée [${req.originalUrl}] est introuvable. Toutes les routes API sont préfixées par /api/v1.`, 404));
});

// Gestionnaire d'erreurs global (doit être après toutes les routes)
app.use(errorHandler);

module.exports = app;
