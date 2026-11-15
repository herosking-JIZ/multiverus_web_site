const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AppError = require('../utils/appError');

const isServerless = process.env.VERCEL === '1' || !!process.env.VERCEL_ENV;
const defaultStoragePath = isServerless
  ? '/tmp/uploads'
  : path.join(process.cwd(), 'uploads');

const STORAGE_PATH = process.env.MEDIA_STORAGE_PATH
  ? path.resolve(process.env.MEDIA_STORAGE_PATH)
  : defaultStoragePath;

const ALLOWED_MIMES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif',
  'application/pdf', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'video/mp4', 'video/webm', 'video/mpeg', 'video/ogg', 'video/quicktime',
  'video/x-ms-wmv', 'video/x-flv', 'video/avi', 'video/mov', 'video/mkv',
];

// En Serverless (Vercel) ou avec stockage Cloud (Supabase S3 / R2),
// nous utilisons memoryStorage() pour :
// 1. Éviter d'écrire sur le système de fichiers en lecture seule de Vercel (/var/task)
// 2. Envoyer le buffer directement à Supabase Storage sans latence disque
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 250 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIMES.includes(file.mimetype)) {
      return cb(new AppError('Type de fichier non autorisé. Formats acceptés : JPG, PNG, WEBP, SVG, PDF, Vidéos...', 400));
    }
    cb(null, true);
  },
});

module.exports = { upload, STORAGE_PATH };
