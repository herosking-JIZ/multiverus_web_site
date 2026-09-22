const Joi = require('joi');

// ===================================================================
// FORMULAIRE PUBLIC (POST /contact)
// ===================================================================
const leadSchema = Joi.object({
  nomComplet: Joi.string().min(2).max(200).trim().required(),
  email: Joi.string().email({ tlds: { allow: false } }).max(200).lowercase().trim().required(),
  organisation: Joi.string().max(200).trim().allow('', null),
  sujet: Joi.string().max(200).trim().required(),
  message: Joi.string().min(10).max(2000).trim().required(),
});

// ===================================================================
// MISE À JOUR DU STATUT (PATCH /admin/leads/:id/statut)
// ===================================================================
const updateStatutSchema = Joi.object({
  statut: Joi.string()
    .valid('NOUVEAU', 'EN_COURS', 'TRAITE', 'ARCHIVE')
    .required()
    .messages({ 'any.only': 'Statut invalide. Valeurs : NOUVEAU, EN_COURS, TRAITE, ARCHIVE' }),
});

// ===================================================================
// AJOUT DE NOTES (PATCH /admin/leads/:id/notes)
// ===================================================================
const addNoteSchema = Joi.object({
  notes: Joi.string().min(1).max(5000).trim().required(),
});

module.exports = { leadSchema, updateStatutSchema, addNoteSchema };
