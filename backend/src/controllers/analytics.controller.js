const analyticsService = require('../services/analytics.service');

class AnalyticsController {
  // ===================================================================
  // PUBLIC : POST /analytics/event
  // ===================================================================
  async recordEvent(req, res, next) {
    try {
      const userAgent = req.get('User-Agent');
      await analyticsService.recordEvent(req.body, userAgent);

      return res.status(201).json({ success: true });
    } catch (err) {
      next(err);
    }
  }

  // ===================================================================
  // ADMIN : GET /admin/analytics/dashboard
  // ===================================================================
  async getDashboard(req, res, next) {
    try {
      const { from, to } = req.query;

      // Défaut : 30 derniers jours
      const dateTo = to ? new Date(to) : new Date();
      const dateFrom = from
        ? new Date(from)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      // Validation des dates
      if (isNaN(dateFrom.getTime()) || isNaN(dateTo.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Paramètres from/to invalides. Format attendu : ISO 8601 (ex: 2026-01-01).',
        });
      }

      if (dateFrom > dateTo) {
        return res.status(400).json({
          success: false,
          message: 'La date de début doit être antérieure à la date de fin.',
        });
      }

      const dashboard = await analyticsService.getDashboard(dateFrom, dateTo);

      return res.json({ success: true, data: dashboard });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AnalyticsController();
