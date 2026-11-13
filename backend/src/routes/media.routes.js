const express = require('express');
const { upload } = require('../middlewares/upload.middleware');
const verifyToken = require('../middlewares/auth.middleware');
const validate = require('../validators/validate');
const Joi = require('joi');
const mediaController = require('../controllers/media.controller');

const router = express.Router();

// ─── Schémas de validation ────────────────────────────────────
const uploadBodySchema = Joi.object({
  dossier: Joi.string().max(200).trim().allow('', null),
});

const presignedUrlSchema = Joi.object({
  nomFichier: Joi.string().max(300).trim().required(),
  typeMime: Joi.string().max(100).trim().required(),
  tailleOctets: Joi.number().positive().required(),
  dossier: Joi.string().max(200).trim().allow('', null),
  altText: Joi.string().max(300).trim().allow('', null),
});

const confirmUploadSchema = Joi.object({
  altText: Joi.string().max(300).trim().allow('', null),
  largeur: Joi.number().integer().positive().allow(null),
  hauteur: Joi.number().integer().positive().allow(null),
  dureeSecondes: Joi.number().integer().positive().allow(null),
});

const altTextSchema = Joi.object({
  altText: Joi.string().max(300).trim().allow('', null).required(),
});

// ===================================================================
// ROUTES ADMIN
// ===================================================================

// POST /admin/medias/presigned-url — Génération d'URL d'upload direct S3/R2 (contourne la limite 4.5 Mo de Vercel)
router.post(
  '/admin/medias/presigned-url',
  verifyToken,
  validate(presignedUrlSchema),
  mediaController.getPresignedUrl
);

// POST /admin/medias/:id/confirm — Confirmation après upload direct vers le bucket
router.post(
  '/admin/medias/:id/confirm',
  verifyToken,
  validate(confirmUploadSchema),
  mediaController.confirmUpload
);

// POST /admin/medias/upload — upload classique via multipart/form-data (petits fichiers ou fallback)
router.post(
  '/admin/medias/upload',
  verifyToken,
  upload.single('fichier'),
  validate(uploadBodySchema),
  mediaController.upload
);

router.get('/admin/medias', verifyToken, mediaController.findAll);

router.patch(
  '/admin/medias/:id',
  verifyToken,
  validate(altTextSchema),
  mediaController.updateAltText
);

router.delete('/admin/medias/:id', verifyToken, mediaController.delete);

module.exports = router;
