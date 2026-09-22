const Joi = require('joi');

const createReferenceSchema = Joi.object({
  titre: Joi.string().min(2).max(300).trim().required(),
  client: Joi.string().min(2).max(200).trim().required(),
  secteur: Joi.string().max(150).trim().required(),
  description: Joi.string().min(10).trim().required(),
  technologies: Joi.array().items(Joi.string().max(100)).allow(null),
  logoId: Joi.string().uuid().allow('', null),
  dateRealisation: Joi.date().iso().allow(null),
  publie: Joi.boolean().default(true),
});

const updateReferenceSchema = Joi.object({
  titre: Joi.string().min(2).max(300).trim(),
  client: Joi.string().min(2).max(200).trim(),
  secteur: Joi.string().max(150).trim(),
  description: Joi.string().min(10).trim(),
  technologies: Joi.array().items(Joi.string().max(100)).allow(null),
  logoId: Joi.string().uuid().allow('', null),
  dateRealisation: Joi.date().iso().allow(null),
  publie: Joi.boolean(),
}).min(1);

module.exports = { createReferenceSchema, updateReferenceSchema };
