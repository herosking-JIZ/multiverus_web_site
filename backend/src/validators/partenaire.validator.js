const Joi = require('joi');

const createPartenaireSchema = Joi.object({
  nom: Joi.string().min(2).max(200).trim().required(),
  logoId: Joi.string().uuid().allow('', null),
  siteWeb: Joi.string().uri().max(300).allow('', null),
  ordre: Joi.number().integer().min(0).default(0),
  actif: Joi.boolean().default(true),
});

const updatePartenaireSchema = Joi.object({
  nom: Joi.string().min(2).max(200).trim(),
  logoId: Joi.string().uuid().allow('', null),
  siteWeb: Joi.string().uri().max(300).allow('', null),
  ordre: Joi.number().integer().min(0),
  actif: Joi.boolean(),
}).min(1);

const reorderSchema = Joi.object({
  ids: Joi.array().items(Joi.string().uuid()).min(1).required()
    .messages({ 'array.min': 'Au moins un ID est requis.' }),
});

module.exports = { createPartenaireSchema, updatePartenaireSchema, reorderSchema };
