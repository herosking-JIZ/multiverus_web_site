const leadService = require('../services/lead.service');
const logAction = require('../utils/auditLog');
const { getPagination, paginatedResponse } = require('../utils/paginate');

/**
 * Génère une ligne CSV en échappant correctement les guillemets.
 */
const toCsvRow = (values) =>
  values.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',');

class LeadController {
  // ===================================================================
  // PUBLIC : POST /contact
  // ===================================================================
  async contact(req, res, next) {
    try {
      const ipAdresse = req.ip || req.connection.remoteAddress;
      const lead = await leadService.createFromContact(req.body, ipAdresse);

      return res.status(201).json({
        success: true,
        message: 'Votre message a bien été envoyé. Nous vous répondrons dans les plus brefs délais.',
        data: { id: lead.id },
      });
    } catch (err) {
      next(err);
    }
  }

  // ===================================================================
  // ADMIN
  // ===================================================================
  async findAll(req, res, next) {
    try {
      const { page, limit, skip } = getPagination(req.query);
      const { statut, from, to } = req.query;
      const { data, total } = await leadService.findAll({
        page, limit, skip, statut, from, to,
      });
      return res.json({ success: true, ...paginatedResponse(data, total, page, limit) });
    } catch (err) {
      next(err);
    }
  }

  async findOne(req, res, next) {
    try {
      const lead = await leadService.findOne(req.params.id);
      return res.json({ success: true, data: lead });
    } catch (err) {
      next(err);
    }
  }

  async updateStatut(req, res, next) {
    try {
      const lead = await leadService.updateStatut(req.params.id, req.body.statut, req.user.id);
      await logAction(req, req.user.id, 'UPDATE_LEAD_STATUT', 'LEAD', lead.id, {
        statut: req.body.statut,
      });
      return res.json({
        success: true,
        message: 'Statut du lead mis à jour.',
        data: lead,
      });
    } catch (err) {
      next(err);
    }
  }

  async addNote(req, res, next) {
    try {
      const lead = await leadService.addNote(req.params.id, req.body.notes);
      await logAction(req, req.user.id, 'ADD_NOTE_LEAD', 'LEAD', lead.id);
      return res.json({
        success: true,
        message: 'Note ajoutée.',
        data: lead,
      });
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      await leadService.delete(req.params.id);
      await logAction(req, req.user.id, 'DELETE_LEAD', 'LEAD', req.params.id);
      return res.json({ success: true, message: 'Lead supprimé.' });
    } catch (err) {
      next(err);
    }
  }

  async exportCsv(req, res, next) {
    try {
      const { statut, from, to } = req.query;
      const leads = await leadService.findAllForExport({ statut, from, to });

      const header = ['ID', 'Nom', 'Email', 'Organisation', 'Sujet', 'Message', 'Statut', 'Notes internes', 'IP', 'Date création'];

      const rows = leads.map((l) =>
        toCsvRow([
          l.id,
          l.nomComplet,
          l.email,
          l.organisation || '',
          l.sujet,
          l.message,
          l.statut,
          l.notesInternes || '',
          l.ipAdresse || '',
          l.createdAt.toISOString(),
        ])
      );

      const csv = [toCsvRow(header), ...rows].join('\r\n');

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="leads-${new Date().toISOString().slice(0, 10)}.csv"`
      );

      // BOM UTF-8 pour compatibilité Excel
      return res.send('\uFEFF' + csv);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new LeadController();
