const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const AppError = require('../utils/appError');

const STORAGE_PATH = process.env.MEDIA_STORAGE_PATH
  ? path.resolve(process.env.MEDIA_STORAGE_PATH)
  : path.join(process.cwd(), 'uploads');

const ALLOWED_MIMES = [
  'image/jpeg', 'image/png', 'image/webp',
  'application/pdf', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'video/mp4', 'video/webm', 'video/mpeg', 'video/ogg', 'video/quicktime',
  'video/x-ms-wmv', 'video/x-flv', 'video/avi', 'video/mov', 'video/mkv',
];

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    // req._uploadDossier permet aux routes entité de forcer un sous-dossier fixe
    // avant que multer parse le body (req.body.dossier = flux multipart)
    const dossier = req._uploadDossier || (req.body && req.body.dossier) || '';
    const dest = dossier ? path.join(STORAGE_PATH, dossier) : STORAGE_PATH;
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 250 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIMES.includes(file.mimetype)) {
      return cb(new AppError('Type de fichier non autorisé. Formats acceptés : JPG, PNG, WEBP, PDF.', 400));
    }
    cb(null, true);
  },
});

module.exports = { upload, STORAGE_PATH };
