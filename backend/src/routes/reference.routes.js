const express = require('express');
const verifyToken = require('../middlewares/auth.middleware');
const validate = require('../validators/validate');
const { upload } = require('../middlewares/upload.middleware');
const { createReferenceSchema, updateReferenceSchema } = require('../validators/reference.validator');
const referenceController = require('../controllers/reference.controller');

const router = express.Router();

// ===================================================================
// ROUTES PUBLIQUES
// ===================================================================
router.get('/references', referenceController.findAllPublic);

// ===================================================================
// ROUTES ADMIN (JWT requis)
// ===================================================================
router.post('/admin/references', verifyToken, validate(createReferenceSchema), referenceController.create);
router.get('/admin/references', verifyToken, referenceController.findAll);
router.get('/admin/references/:id', verifyToken, referenceController.findOne);
router.patch('/admin/references/:id', verifyToken, validate(updateReferenceSchema), referenceController.update);
router.patch(
  '/admin/references/:id/media',
  verifyToken,
  (req, _res, next) => { req._uploadDossier = 'references'; next(); },
  upload.single('fichier'),
  referenceController.replaceLogo
);
router.delete('/admin/references/:id', verifyToken, referenceController.delete);

module.exports = router;
