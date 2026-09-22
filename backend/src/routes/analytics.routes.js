const express = require('express');
const rateLimit = require('express-rate-limit');
const verifyToken = require('../middlewares/auth.middleware');
const validate = require('../validators/validate');
const { eventSchema } = require('../validators/analytics.validator');
const analyticsController = require('../controllers/analytics.controller');

const router = express.Router();

// Rate limiter souple pour le tracking : 120 req/min par IP
const eventLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  message: { success: false, message: 'Trop de requêtes de tracking.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ===================================================================
// ROUTE PUBLIQUE (tracking frontend)
// ===================================================================
router.post('/analytics/event', eventLimiter, validate(eventSchema), analyticsController.recordEvent);

// ===================================================================
// ROUTE ADMIN (dashboard KPIs)
// ===================================================================
router.get('/admin/analytics/dashboard', verifyToken, analyticsController.getDashboard);

module.exports = router;
