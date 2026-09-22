const express = require('express');
const verifyToken = require('../middlewares/auth.middleware');
const validate = require('../validators/validate');
const { upload } = require('../middlewares/upload.middleware');
const {
  createPartenaireSchema,
  updatePartenaireSchema,
  reorderSchema,
} = require('../validators/partenaire.validator');
const partenaireController = require('../controllers/partenaire.controller');

const router = express.Router();

// ===================================================================
// ROUTES PUBLIQUES
// ===================================================================
router.get('/partenaires', partenaireController.findAllPublic);

// ===================================================================
// ROUTES ADMIN (JWT requis)
// ===================================================================
router.post('/admin/partenaires', verifyToken, validate(createPartenaireSchema), partenaireController.create);
router.get('/admin/partenaires', verifyToken, partenaireController.findAll);

// IMPORTANT : /reorder avant /:id
router.patch('/admin/partenaires/reorder', verifyToken, validate(reorderSchema), partenaireController.reorder);

router.get('/admin/partenaires/:id', verifyToken, partenaireController.findOne);
router.patch('/admin/partenaires/:id', verifyToken, validate(updatePartenaireSchema), partenaireController.update);
router.patch(
  '/admin/partenaires/:id/media',
  verifyToken,
  (req, _res, next) => { req._uploadDossier = 'partenaires'; next(); },
  upload.single('fichier'),
  partenaireController.replaceLogo
);
router.delete('/admin/partenaires/:id', verifyToken, partenaireController.delete);

module.exports = router;
