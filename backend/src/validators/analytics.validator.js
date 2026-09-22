const Joi = require('joi');

// Événement depuis le frontend
const eventSchema = Joi.object({
  sessionId: Joi.string().uuid().required(),
  pagePath: Joi.string().max(500).trim().required(),
  evenement: Joi.string()
    .valid('PAGEVIEW', 'CLICK', 'DOWNLOAD', 'FORM_SUBMIT')
    .required(),
  dureeSecondes: Joi.number().integer().min(0).allow(null),
  referrer: Joi.string().max(500).trim().allow('', null),
});

module.exports = { eventSchema };
