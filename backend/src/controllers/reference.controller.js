const referenceService = require('../services/reference.service');
const logAction = require('../utils/auditLog');
const { getPagination, paginatedResponse } = require('../utils/paginate');
const fs = require('fs');

class ReferenceController {
  async create(req, res, next) {
    try {
      const reference = await referenceService.create(req.body, req.user.id);
      await logAction(req, req.user.id, 'CREATE_REFERENCE', 'PROJET', reference.id);
      return res.status(201).json({
        success: true,
        message: 'Référence créée avec succès.',
        data: reference,
      });
    } catch (err) {
      next(err);
    }
  }

  async findAll(req, res, next) {
    try {
      const { page, limit, skip } = getPagination(req.query);
      const { secteur, publie } = req.query;
      const { data, total } = await referenceService.findAll({
        page, limit, skip, secteur, publie,
      });
      return res.json({ success: true, ...paginatedResponse(data, total, page, limit) });
    } catch (err) {
      next(err);
    }
  }

  async findOne(req, res, next) {
    try {
      const reference = await referenceService.findOne(req.params.id);
      return res.json({ success: true, data: reference });
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const reference = await referenceService.update(req.params.id, req.body, req.user.id);
      await logAction(req, req.user.id, 'UPDATE_REFERENCE', 'PROJET', reference.id, req.body);
      return res.json({
        success: true,
        message: 'Référence mise à jour.',
        data: reference,
      });
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      await referenceService.delete(req.params.id);
      await logAction(req, req.user.id, 'DELETE_REFERENCE', 'PROJET', req.params.id);
      return res.json({ success: true, message: 'Référence supprimée.' });
    } catch (err) {
      next(err);
    }
  }

  async replaceLogo(req, res, next) {
    try {
      if (!req.file) throw new (require('../utils/appError'))('Aucun fichier reçu.', 400);
      const media = await referenceService.replaceLogo(req.params.id, req.file, req.user.id);
      await logAction(req, req.user.id, 'REPLACE_LOGO_REFERENCE', 'PROJET', req.params.id, { mediaId: media.id });
      return res.json({ success: true, message: 'Logo de la référence mis à jour.', data: media });
    } catch (err) {
      if (req.file?.path) { try { fs.unlinkSync(req.file.path); } catch { /* ignore */ } }
      next(err);
    }
  }

  async findAllPublic(req, res, next) {
    try {
      const { page, limit, skip } = getPagination(req.query);
      const { secteur } = req.query;
      const { data, total } = await referenceService.findAllPublic({ skip, limit, secteur });
      return res.json({ success: true, ...paginatedResponse(data, total, page, limit) });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ReferenceController();
