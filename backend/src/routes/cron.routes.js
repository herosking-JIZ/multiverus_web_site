const express = require('express');
const cronController = require('../controllers/cron.controller');

const router = express.Router();

/**
 * GET /api/v1/cron/cleanup-pending
 * Endpoint compatible Vercel Cron Jobs (déclaré dans vercel.json)
 */
router.get('/cleanup-pending', cronController.cleanupPendingUploads);

module.exports = router;

