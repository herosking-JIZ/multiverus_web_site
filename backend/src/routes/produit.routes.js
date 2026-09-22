const express = require('express');
const verifyToken = require('../middlewares/auth.middleware');
const validate = require('../validators/validate');
const { upload } = require('../middlewares/upload.middleware');
const { createProduitSchema, updateProduitSchema } = require('../validators/produit.validator');
const produitController = require('../controllers/produit.controller');

const router = express.Router();

// ===================================================================
// ROUTES PUBLIQUES
// ===================================================================
router.get('/produits', produitController.findAllPublic);
router.get('/produits/:slug', produitController.findOnePublic);

// ===================================================================
// ROUTES ADMIN (JWT requis)
// ===================================================================
router.post('/admin/produits', verifyToken, validate(createProduitSchema), produitController.create);
router.get('/admin/produits', verifyToken, produitController.findAll);
router.get('/admin/produits/:id', verifyToken, produitController.findOne);
router.patch('/admin/produits/:id', verifyToken, validate(updateProduitSchema), produitController.update);
router.patch(
  '/admin/produits/:id/media',
  verifyToken,
  (req, _res, next) => { req._uploadDossier = 'produits'; next(); },
  upload.single('fichier'),
  produitController.replaceImage
);
router.delete('/admin/produits/:id', verifyToken, produitController.delete);

module.exports = router;
