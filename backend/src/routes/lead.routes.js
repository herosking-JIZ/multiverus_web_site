const express = require('express');
const rateLimit = require('express-rate-limit');
const verifyToken = require('../middlewares/auth.middleware');
const validate = require('../validators/validate');
const { leadSchema, updateStatutSchema, addNoteSchema } = require('../validators/lead.validator');
const leadController = require('../controllers/lead.controller');

const router = express.Router();

// Rate limiter strict pour le formulaire public : 5 req/min par IP
const contactLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Trop de tentatives. Veuillez patienter une minute avant de réessayer.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ===================================================================
// ROUTE PUBLIQUE
// ===================================================================
router.post('/contact', contactLimiter, validate(leadSchema), leadController.contact);

// ===================================================================
// ROUTES ADMIN (JWT requis)
// IMPORTANT : /export doit être avant /:id
// ===================================================================
router.get('/admin/leads/export', verifyToken, leadController.exportCsv);
router.get('/admin/leads', verifyToken, leadController.findAll);
router.get('/admin/leads/:id', verifyToken, leadController.findOne);
router.patch('/admin/leads/:id/statut', verifyToken, validate(updateStatutSchema), leadController.updateStatut);
router.patch('/admin/leads/:id/notes', verifyToken, validate(addNoteSchema), leadController.addNote);
router.delete('/admin/leads/:id', verifyToken, leadController.delete);

module.exports = router;
