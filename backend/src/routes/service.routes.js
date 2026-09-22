const express = require('express');
const verifyToken = require('../middlewares/auth.middleware');
const validate = require('../validators/validate');
const { upload } = require('../middlewares/upload.middleware');
const {
  createServiceSchema,
  updateServiceSchema,
  reorderSchema,
} = require('../validators/service.validator');
const serviceController = require('../controllers/service.controller');

const router = express.Router();

// ===================================================================
// ROUTES PUBLIQUES
// ===================================================================
router.get('/services', serviceController.findAllPublic);
router.get('/services/:slug', serviceController.findOnePublic);

// ===================================================================
// ROUTES ADMIN (JWT requis)
// ===================================================================
router.post('/admin/services', verifyToken, validate(createServiceSchema), serviceController.create);
router.get('/admin/services', verifyToken, serviceController.findAll);

// IMPORTANT : /reorder doit être déclaré AVANT /:id pour éviter la collision de route
router.patch('/admin/services/reorder', verifyToken, validate(reorderSchema), serviceController.reorder);

router.get('/admin/services/:id', verifyToken, serviceController.findOne);
router.patch('/admin/services/:id', verifyToken, validate(updateServiceSchema), serviceController.update);
router.patch(
  '/admin/services/:id/media',
  verifyToken,
  (req, _res, next) => { req._uploadDossier = 'services'; next(); },
  upload.single('fichier'),
  serviceController.replaceImage
);
router.delete('/admin/services/:id', verifyToken, serviceController.delete);

module.exports = router;
