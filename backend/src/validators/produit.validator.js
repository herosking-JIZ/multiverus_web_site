const Joi = require('joi');

const createProduitSchema = Joi.object({
  nom: Joi.string().min(2).max(200).trim().required(),
  description: Joi.string().min(10).trim().required(),
  categorie: Joi.string().max(100).trim().required(),
  statut: Joi.string().valid('NOUVEAU', 'ACTIF', 'ARCHIVE').default('ACTIF'),
  features: Joi.array().items(Joi.string().max(300)).allow(null),
  imageId: Joi.string().uuid().allow('', null),
  actif: Joi.boolean().default(true),
});

const updateProduitSchema = Joi.object({
  nom: Joi.string().min(2).max(200).trim(),
  description: Joi.string().min(10).trim(),
  categorie: Joi.string().max(100).trim(),
  statut: Joi.string().valid('NOUVEAU', 'ACTIF', 'ARCHIVE'),
  features: Joi.array().items(Joi.string().max(300)).allow(null),
  imageId: Joi.string().uuid().allow('', null),
  actif: Joi.boolean(),
}).min(1);

module.exports = { createProduitSchema, updateProduitSchema };
