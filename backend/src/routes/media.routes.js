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

const altTextSchema = Joi.object({
  altText: Joi.string().max(300).trim().allow('', null).required(),
});

// ===================================================================
// ROUTES ADMIN
// ===================================================================

// POST /admin/medias/upload — upload direct (multipart/form-data)
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
