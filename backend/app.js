const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const router = require('./src/routes/route');
const errorHandler = require('./src/middlewares/error.middleware');
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

// Configuration CORS (Toutes origines autorisées actuellement)
const allowedOrigins = [
    'http://100.119.90.39:3000',
    'http://100.119.90.39:5173',
    'http://100.119.90.39',
    process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // indispensable pour les cookies CSRF
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'x-csrf-token'],
}));



app.use(helmet());

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

// Protection CSRF globale (après la route publique)
app.use(doubleCsrfProtection);

// Routes API
app.use('/api/v1', router);
// Middleware 404 - Route non trouvée
app.use((req, res, next) => {
    const error = new Error(`La ressource demandée [${req.originalUrl}] est introuvable.`);
    error.statusCode = 404;
    next(error);
});

// Gestionnaire d'erreurs global (doit être après toutes les routes)
app.use(errorHandler);

module.exports = app;
