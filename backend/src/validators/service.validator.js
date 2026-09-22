const Joi = require('joi');

const createServiceSchema = Joi.object({
  titre: Joi.string().min(2).max(200).trim().required(),
  description: Joi.string().min(10).trim().required(),
  icone: Joi.string().max(100).trim().allow('', null),
  imageId: Joi.string().uuid().allow('', null),
  ordre: Joi.number().integer().min(0).default(0),
  actif: Joi.boolean().default(true),
});

const updateServiceSchema = Joi.object({
  titre: Joi.string().min(2).max(200).trim(),
  description: Joi.string().min(10).trim(),
  icone: Joi.string().max(100).trim().allow('', null),
  imageId: Joi.string().uuid().allow('', null),
  ordre: Joi.number().integer().min(0),
  actif: Joi.boolean(),
}).min(1);

const reorderSchema = Joi.object({
  ids: Joi.array().items(Joi.string().uuid()).min(1).required()
    .messages({ 'array.min': 'Au moins un ID est requis.' }),
});

module.exports = { createServiceSchema, updateServiceSchema, reorderSchema };
